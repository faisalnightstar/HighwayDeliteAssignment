import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        //console.log("JWT received Token: ", token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        //console.log("Decoded Token:", decodedToken);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        //console.log("user found in verifyJWT: ", user);
        if (!user) {
            console.log("User not found");
            throw new ApiError(401, "User not found");
        }

        if (!user) {
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        //console.error("JWT Verification Error:", error);
        if (error.name === "TokenExpiredError") {
            throw new ApiError(
                401,
                error?.message || "JWT Verification Failed"
            );
        }
        throw new ApiError(401, error?.message || "JWT Verification Failed");
    }
});
