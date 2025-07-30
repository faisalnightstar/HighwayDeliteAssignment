import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import Dashboard from "./pages/dashboardPage/Dashboard.jsx";
import AuthLayout from "./pages/authPage/AuthLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthProtectedRoute from "./components/AuthProtectedRoute.jsx";
import ErrorFallbackComponent from "./components/ErrorFallbackComponent.jsx";
import "./index.css";
import NotFoundPage from "./pages/fallbackPage/NotFoundPage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorFallbackComponent />,
        children: [
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/auth",
                element: (
                    <AuthProtectedRoute>
                        <AuthLayout />
                    </AuthProtectedRoute>
                ),
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" reverseOrder={false} />
        </AuthProvider>
    </React.StrictMode>
);
