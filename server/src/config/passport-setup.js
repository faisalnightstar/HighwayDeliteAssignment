import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import crypto from "crypto";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/users/google/callback", // Matches the route we will create
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find a user based on their googleId or email
                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
                });

                if (user) {
                    // If user exists, this is a login.
                    // Update details if they've changed on Google and ensure googleId is set.
                    user.googleId = profile.id;
                    user.avatar = user.avatar || profile.photos[0].value;
                    user.loginType = "GOOGLE";
                    await user.save({ validateBeforeSave: false });
                    return done(null, user);
                } else {
                    // If user does not exist, this is a signup.
                    // Generate a temporary unique username from the email
                    const username = profile.emails[0].value.split("@")[0] + crypto.randomBytes(3).toString("hex");

                    const newUser = await User.create({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        username: username,
                        avatar: profile.photos[0].value,
                        loginType: "GOOGLE",
                        isVerified: true, // Email is considered verified by Google
                    });

                    return done(null, newUser);
                }
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Note: We are using a stateless JWT approach, so session serialization is not needed.
// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));