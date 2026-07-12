import { ZodError } from 'zod';
import { errorResponse } from '../responses/apiResponse.js';
export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const dataToValidate = req.method === 'GET' ? req.query : req.body;
            const parsedData = await schema.parseAsync(dataToValidate);
            if (req.method === 'GET') {
                req.query = parsedData;
            }
            else {
                req.body = parsedData;
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    ...errorResponse('Validation failed', 'VALIDATION_ERROR'),
                    errors: error.issues,
                });
            }
            next(error);
        }
    };
};
