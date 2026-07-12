export const successResponse = (message, data) => {
    return {
        success: true,
        message,
        data,
    };
};
export const errorResponse = (message, errorCode) => {
    return {
        success: false,
        message,
        errorCode,
    };
};
