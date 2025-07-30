import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { sendEmail } from "../utils/mailer.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        if (!accessToken) {
            console.error("Access token generation failed for user:", userId); // Log with user ID!
            throw new ApiError(500, "Failed to generate access token");
        }

        const refreshToken = user.generateRefreshToken();
        if (!refreshToken) {
            console.error("Refresh token generation failed for user:", userId); // Log with user ID!
            throw new ApiError(500, "Failed to generate refresh token");
        }

        user.refreshToken = refreshToken;
        try {
            await user.save({ validateBeforeSave: false }); // Consider removing this if possible
        } catch (dbError) {
            console.error("Error saving refresh token to database:", dbError);
            throw new ApiError(500, "Failed to save refresh token"); // More specific message
        }

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateAccessTokenAndRefreshToken:", error); // Crucial!
        throw new ApiError(500, "Something went wrong while generating tokens"); // Keep a general message
    }
};

export const sendRegistrationOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log("email received for registration otp: ", email);
    if (!email) {
        throw new ApiError(400, "Email address is required");
    }

    const verifiedUser = await User.findOne({ email, isVerified: true });
    if (verifiedUser) {
        console.log("User with email already exists: ", email);
        throw new ApiError(
            409,
            "User with this email already exists. Please log in."
        );
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    try {
        await User.findOneAndUpdate(
            { email },
            { $set: { email, otp, otpExpiry, isVerified: false } },
            { upsert: true, new: true }
        );
        await sendEmail({
            email,
            subject: "Your Verification Code",
            html: `Your verification code is: <h1>${otp}</h1> It is valid for 10 minutes.`,
        });
    } catch (error) {
        console.error("Error sending registration OTP:", error);
        throw new ApiError(
            500,
            "There was an issue sending the verification email. Please try again."
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Verification code sent to your email.")
        );
});

export const verifyOtpAndRegister = asyncHandler(async (req, res) => {
    // Password is no longer needed here
    const { fullName, email, dob, otp } = req.body;
    console.log("fullName: ", fullName);
    console.log("email: ", email);
    console.log("dob: ", dob);
    console.log("otp: ", otp);

    if (
        [fullName, email, dob, otp].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        console.error("All fields are required.");
        throw new ApiError(
            400,
            "All fields, including the verification code, are required."
        );
    }

    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
        console.error("Verification session not found. Please start over.");
        throw new ApiError(
            404,
            "Verification session not found. Please start over."
        );
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
        console.error("Invalid or expired verification code.");
        throw new ApiError(400, "Invalid or expired verification code.");
    }

    const existedUser = await User.findOne({
        $or: [{ email }],
        isVerified: true,
    });
    if (existedUser) {
        console.error("Email address is already registered.");
        throw new ApiError(
            409,
            "Email address is already registered. Please log in."
        );
    }

    try {
        user.fullName = fullName;
        user.isVerified = true;
        user.loginType = "EMAIL_OTP";
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();
    } catch (error) {
        console.error("Error saving user:", error);
        throw new ApiError(500, "Failed to save user. Please try again.");
    }

    const createdUser = await User.findById(user._id);
    console.log("createdUser: ", createdUser);
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully!")
        );
});

// --- NEW PASSWORDLESS LOGIN FLOW ---

// Step 1: Send OTP for Login
export const sendLoginOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email address is required.");
    }

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
        throw new ApiError(404, "User with this email is not registered.");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email,
            subject: "Your Login Code",
            html: `Your login code is: <h1>${otp}</h1> It is valid for 10 minutes.`,
        });
    } catch (error) {
        throw new ApiError(500, "Failed to send login code. Please try again.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "A login code has been sent to your email."
            )
        );
});

// Step 2: Verify Login OTP and Sign In
export const verifyLoginOtpAndSignIn = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
        throw new ApiError(400, "Invalid or expired login code.");
    }

    // Clear OTP fields after successful login
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    if (process.env.NODE_ENV === "production") {
        options.sameSite = "None"; // For cross-site requests in production
    } else {
        options.sameSite = "Lax"; // More flexible for local development
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

//
export const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email address is required.");
    }

    const user = await User.findOne({ email });

    // We only allow resending OTPs to existing user records (verified or unverified)
    if (!user) {
        throw new ApiError(
            404,
            "No account is associated with this email address."
        );
    }

    // Generate a new OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Determine the subject based on whether the user is already verified
    const subject = user.isVerified
        ? "Your New Login Code"
        : "Your New Verification Code";

    try {
        await sendEmail({
            email: user.email,
            subject: subject,
            html: `Your new code is: <h1>${otp}</h1> It is valid for 10 minutes.`,
        });
    } catch (error) {
        throw new ApiError(
            500,
            "There was an issue resending the code. Please try again."
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "A new code has been sent to your email.")
        );
});

// NEW CONTROLLER: Handles the callback from Google
export const googleCallbackHandler = asyncHandler(async (req, res) => {
    // Passport.js middleware has done the heavy lifting and attached the user to req.user
    const user = req.user;
    if (!user) {
        throw new ApiError(
            401,
            "Google authentication failed. Please try again."
        );
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
        sameSite: "None",
    };

    // Redirect to frontend with tokens, or send them in the response
    // For a web client, redirecting is common.
    // Example Redirect:
    // return res.redirect(`${process.env.CORS_ORIGIN}/auth-success?accessToken=${accessToken}`);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                "Successfully logged in with Google."
            )
        );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("refreshToken to get current user: ", req.cookies.refreshToken);
    return res
        .status(200)
        .json(new ApiResponse(201, req.user, "Current User found"));
});

// const updateAccountDetails = asyncHandler(async (req, res) => {
//     const {
//         fullName,
//         username,
//         email,
//         phone,
//         languages,
//         travelPreference,
//         address,
//     } = req.body;

//     console.log(
//         `fullName: ${fullName}, username: ${username}, email: ${email}, phone: ${phone}, languages: ${languages}, travelPreference: ${travelPreference},address: ${address}`
//     );
//     if (!fullName || !username || !email || !phone) {
//         throw new ApiError(
//             400,
//             "All field are required to update account details."
//         );
//     }
//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullName,
//                 username,
//                 email,
//                 phone,
//                 languages,
//                 travelPreference,
//                 address,
//             },
//         },
//         {
//             new: true,
//         }
//     ).select("-password");

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(201, user, "Account details updated successfully")
//         );
// });

// const updateUserAvatar = asyncHandler(async (req, res) => {
//     const avatarLocalPath = req.file?.path;

//     console.log("avatarLocalPath: ", avatarLocalPath);

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required to be file uploaded");
//     }

//     // Fetch the current user from the database
//     const user = await User.findById(req.user?._id);
//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }

//     // If user already has an avatar, delete it from Cloudinary
//     if (user.avatar) {
//         const publicId = extractPublicId(user.avatar);
//         if (publicId) {
//             console.log("Deleting old avatar with publicId:", publicId);
//             await deleteOnCloudinary(publicId);
//         }
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     console.log("avatar: ", avatar);

//     if (!avatar.url) {
//         console.error("Something went wrong while uploading avatar");
//         throw new ApiError(400, "Something went wrong while uploading avatar");
//     }
//     const updatedUser = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 avatar: avatar.url,
//             },
//         },
//         {
//             new: true,
//         }
//     ).select("-password");

//     return res
//         .status(200)
//         .json(new ApiResponse(201, updatedUser, "Avatar updated successfully"));
// });

// Add these functions to your user.controller.js file

export const resendVerificationOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email address is required.");
    }

    const user = await User.findOne({ email });

    // Can't resend if the user doesn't exist or is already verified
    if (!user) {
        throw new ApiError(404, "User with this email does not exist.");
    }
    if (user.isVerified) {
        throw new ApiError(400, "This account has already been verified.");
    }

    // Generate a new OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Your New Verification Code",
            html: `Your new verification code is: <h1>${otp}</h1> It is valid for 10 minutes.`,
        });
    } catch (error) {
        throw new ApiError(
            500,
            "There was an issue sending the verification email. Please try again."
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "A new verification code has been sent to your email."
            )
        );
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email address is required.");
    }

    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
        // We don't want to reveal if a user exists or not for security reasons
        throw new ApiError(
            404,
            "If an account with that email exists, a password reset link has been sent."
        );
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before saving it to the database
    user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Create the reset URL for the email
    const resetURL = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetURL}">${resetURL}</a></p><p>This link is valid for 10 minutes.</p>`,
        });
    } catch (error) {
        // Clear the token if email fails to send
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(
            500,
            "Failed to send password reset email. Please try again."
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "If an account with that email exists, a password reset link has been sent."
            )
        );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    console.log("token: ", token, "newPassword: ", newPassword);

    if (!newPassword) {
        throw new ApiError(400, "A new password is required.");
    }

    // Hash the token from the URL to match the one in the DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user by the hashed token and check expiry
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
        throw new ApiError(
            400,
            "Password reset token is invalid or has expired."
        );
    }

    // Set the new password
    user.password = newPassword; // The pre-save hook will hash it

    // Clear the reset fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password has been reset successfully.")
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    console.log("logoutUser", req.user._id);
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, // this removes the field from the document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,

                req.user.fullName, //{},
                "User logged Out Successfully"
            )
        );
});
