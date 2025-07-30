class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.error = error;
        this.name = "ApiError";

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal sever error.";

    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ApiError(400, message);
    }
    if (err.message === "JsonWebTokenError") {
        const message = `JSON Web Token is invalid, Try again`;
        err = new ApiError(400, message);
    }
    if (err.message === "TokenExpiredError") {
        const message = `JSON Web Token is expired, Try again`;
        err = new ApiError(400, message);
    }
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ApiError(400, message);
    }

    return res.status(err.statusCode).json({
        success: false,
        error: err.error,
        statusCode: err.statusCode,
        message: err.message,
    });
};

export { ApiError };
