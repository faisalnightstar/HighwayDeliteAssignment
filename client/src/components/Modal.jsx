import React from "react";
import { MdClose } from "react-icons/md";
import Button from "./Button";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h3>
                    <Button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        <MdClose size={24} />
                    </Button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
