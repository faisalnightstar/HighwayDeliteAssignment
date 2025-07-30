import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/CustomInput";
import toast from "react-hot-toast";
import envConfig from "../../../conf/envConfiq";
import axios from "axios";
import { FaRegEnvelope, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ResendOtpButton from "../../components/ResendOtpButton";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";

const Login = ({ toggleForm }) => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { refetchUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm({ mode: "onBlur" });

    const handleGetOtp = async (data) => {
        setIsLoading(true);
        const toastId = toast.loading("Sending OTP...");
        try {
            await axios.post(`${envConfig.BaseUrl}/users/login-otp`, {
                email: data.email,
            });
            toast.success("OTP sent successfully!", { id: toastId });
            setStep(2);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to send OTP.",
                { id: toastId }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async (data) => {
        setIsLoading(true);
        const toastId = toast.loading("Signing in...");
        try {
            await axios.post(`${envConfig.BaseUrl}/users/verify-login`, data, {
                withCredentials: true,
            });
            await refetchUser();
            toast.success("Login successful!", { id: toastId });
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.", {
                id: toastId,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center mt-8">
            <div className="mb-8 flex flex-col items-center md:items-start ">
                <img
                    src="/logo.png"
                    alt="HD Logo"
                    className="h-8 w-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-heading-color">
                    Sign in
                </h1>
                <p className="text-paragraph-color mt-2 text-sm">
                    Please login to continue to your account.
                </p>
            </div>
            <form
                onSubmit={handleSubmit(
                    step === 1 ? handleGetOtp : handleSignIn
                )}
                className="space-y-6"
                noValidate
            >
                <CustomInput
                    className="font-inter "
                    id="email"
                    label="Email"
                    type="email"
                    icon={FaRegEnvelope}
                    register={register("email", {
                        required: "Email is required.",
                    })}
                    error={errors.email}
                    disabled={isLoading || step === 2}
                />
                {step === 2 && (
                    <>
                        <CustomInput
                            className="font-inter"
                            id="otp"
                            label="OTP"
                            type="text"
                            icon={FaKey}
                            register={register("otp", {
                                required: "OTP is required.",
                            })}
                            error={errors.otp}
                            disabled={isLoading}
                        />
                        <div className="text-right">
                            <ResendOtpButton
                                getEmail={getValues}
                                disabled={isLoading}
                            />
                        </div>
                    </>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-btn-bg-color text-button-color py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isLoading
                        ? "Processing..."
                        : step === 1
                        ? "Get OTP"
                        : "Sign In"}
                </Button>
            </form>
            <p className="mt-8 text-center text-gray-600">
                Don't have an account?{" "}
                <button
                    onClick={toggleForm}
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Sign up
                </button>
            </p>
        </div>
    );
};

export default Login;
