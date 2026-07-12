import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { errorResponse } from '../responses/apiResponse.js';
import { logger } from '../../config/logger.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`[${err.errorCode || 'ERROR'}] ${err.message}`);
    return res.status(err.statusCode).json(errorResponse(err.message, err.errorCode));
  }

  // Handle Prisma Database Errors securely
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`[PRISMA_ERROR_${err.code}] ${err.message}`);
    
    // Unique constraint failed
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` on ${err.meta.target}` : '';
      return res.status(409).json(errorResponse(`A record with this value already exists${target}.`, 'DUPLICATE_RECORD'));
    }
    
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json(errorResponse('The requested record was not found.', 'NOT_FOUND'));
    }

    return res.status(400).json(errorResponse('Database request failed.', 'DB_ERROR'));
  }

  // Handle generic or unhandled errors
  logger.error(`[UNHANDLED] ${err.stack}`);
  return res.status(500).json(errorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR'));
};
