import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/CustomInput";
import toast from "react-hot-toast";
import envConfig from "../../../conf/envConfiq";
import axios from "axios";
import {
    FaRegUser,
    FaRegCalendarAlt,
    FaRegEnvelope,
    FaKey,
    FaGoogle,
} from "react-icons/fa";
import ResendOtpButton from "../../components/ResendOtpButton";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

const SignUp = ({ toggleForm }) => {
    const [step, setStep] = useState(1);
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
            await axios.post(`${envConfig.BaseUrl}/users/send-otp`, {
                email: data.email,
            });
            toast.success("OTP sent successfully!", { id: toastId });
            setStep(2);
        } catch (error) {
            toast.error("Failed to send OTP.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (data) => {
        setIsLoading(true);
        const toastId = toast.loading("Creating your account...");
        try {
            await axios.post(`${envConfig.BaseUrl}/users/register`, data, {
                withCredentials: true,
            });
            //await refetchUser();

            toast.success("Account created! Please sign in.", { id: toastId });
            toggleForm();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Registration failed.",
                { id: toastId }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${envConfig.BaseUrl}/users/google`;
    };

    return (
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center ">
            <div className="mb-8 flex flex-col items-center md:items-start ">
                <img
                    src="/logo.png"
                    alt="HD Logo"
                    className="h-8 w-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
                <p className="text-gray-600 mt-2">
                    Sign up to enjoy the feature of HD
                </p>
            </div>
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <FaGoogle className="font-bold text-2xl" />
                Continue with Google
            </button>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <form
                onSubmit={handleSubmit(
                    step === 1 ? handleGetOtp : handleSignUp
                )}
                className="space-y-4 "
                noValidate
            >
                <CustomInput
                    className="mt-4"
                    id="fullName"
                    label="Your Name"
                    icon={FaRegUser}
                    register={register("fullName", {
                        required: "Full name is required.",
                    })}
                    error={errors.fullName}
                    disabled={isLoading}
                />
                <CustomInput
                    id="dob"
                    label="Date of Birth"
                    type="date"
                    icon={FaRegCalendarAlt}
                    register={register("dob", {
                        required: "Date of birth is required.",
                    })}
                    error={errors.dob}
                    disabled={isLoading}
                />
                <CustomInput
                    id="email"
                    label="Email"
                    type="email"
                    icon={FaRegEnvelope}
                    register={register("email", {
                        required: "Email is required.",
                        pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email format.",
                        },
                    })}
                    error={errors.email}
                    disabled={isLoading || step === 2}
                />

                {step === 2 && (
                    <>
                        <CustomInput
                            id="otp"
                            label="OTP"
                            type="text"
                            icon={FaKey}
                            register={register("otp", {
                                required: "OTP is required.",
                                minLength: {
                                    value: 6,
                                    message: "OTP must be 6 digits.",
                                },
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
                    className="w-full bg-blue-600 text-white py-4 mt-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isLoading
                        ? "Processing..."
                        : step === 1
                            ? "Get OTP"
                            : "Sign up"}
                </Button>
            </form>
            <p className="mt-8 text-center text-gray-600">
                Already have an account?{" "}
                <button
                    onClick={toggleForm}
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Sign in
                </button>
            </p>
        </div>
    );
};

export default SignUp;
