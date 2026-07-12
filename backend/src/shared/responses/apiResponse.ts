export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}

export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, errorCode?: string): ApiResponse<null> => {
  return {
    success: false,
    message,
    errorCode,
  };
};
