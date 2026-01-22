import { ApiError } from "../utils/ApiError.utils.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error!";

        error = new ApiError(statusCode, message, [], err.stack);
    }

    res.status(error.statusCode).json({
        success: error.success,
        message: error.message,
        errors: error.errors,
        data: null
    });
};

export { errorHandler };