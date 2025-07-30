import React from "react";

function Button({
    children,
    type = "button",
    bgColor = "#367AFF",
    textColor = "#367AFF",
    className = "",
    ...props
}) {
    return (
        <button
            className={`px-2 py-2 rounded-xl cursor-pointer bg-[#367AFF]  ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
