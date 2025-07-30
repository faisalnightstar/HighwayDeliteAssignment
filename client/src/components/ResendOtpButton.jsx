import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import envConfig from "../../conf/envConfiq";

const ResendOtpButton = ({ getEmail, disabled }) => {
    const [cooldown, setCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        const email = getEmail("email");
        if (cooldown > 0 || !email || disabled) {
            if (!email)
                toast.error(
                    "Please ensure the email field is filled correctly."
                );
            return;
        }

        setIsResending(true);
        const toastId = toast.loading("Resending OTP...");
        try {
            await axios.post(`${envConfig.BaseUrl}/users/resend-otp`, {
                email,
            });
            toast.success("A new OTP has been sent.", { id: toastId });
            setCooldown(60);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to resend OTP.",
                { id: toastId }
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || disabled}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
    );
};

export default ResendOtpButton;
