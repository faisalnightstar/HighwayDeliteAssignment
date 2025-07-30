import React, { useState } from "react";
import SignUp from "./SignUp";
import Login from "./Login";

const AuthLayout = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <div className="max-h-screen bg-white flex items-center justify-center overflow-y-hidden">
            <div className="min-h-screen w-full max-w-full bg-white  shadow-xl overflow-hidden flex flex-col lg:flex-row">
                {isLoginView ? (
                    <Login toggleForm={toggleView} />
                ) : (
                    <SignUp toggleForm={toggleView} />
                )}
                <div className="hidden lg:block lg:w-3/4">
                    <img
                        className="w-full h-full object-cover"
                        src="/auth-bg.jpeg" // Make sure this image is in your `public` folder
                        alt="Abstract background"
                    />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
