import React from "react";

const NoteSkeleton = () => {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 w-6 bg-gray-300 rounded-md"></div>
        </div>
    );
};

export default NoteSkeleton;
