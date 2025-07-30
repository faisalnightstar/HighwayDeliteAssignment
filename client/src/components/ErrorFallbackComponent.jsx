import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import Button from "./Button";

const ErrorFallbackComponent = () => {
    // 1. Get the error from the hook
    const error = useRouteError();
    const navigate = useNavigate();

    // 2. Log the error for debugging
    console.error("React Router caught an error:", error);

    // 3. Define the reset function
    const handleReset = () => {
        // Navigate to the home page to "reset" the state
        navigate("/");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <h1 className="text-2xl font-semibold text-red-600 mb-2">
                Oops! Something went wrong.
            </h1>
            <p className="text-gray-600 mb-4">
                An unexpected error has occurred.
            </p>
            {/* Display error details in development for easier debugging */}
            {import.meta.env.NODE_ENV === "development" && (
                <details className="whitespace-pre-wrap text-left bg-gray-100 p-4 rounded-md">
                    {error.statusText || error.message}
                </details>
            )}
            <Button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go to Homepage
            </Button>
        </div>
    );
};

export default ErrorFallbackComponent;
