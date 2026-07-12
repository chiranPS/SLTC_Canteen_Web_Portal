import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';
import { AppError } from '../errors/AppError.js';
import { Role } from '@prisma/client';

export interface JwtPayload {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Not authenticated. Bearer token missing.', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden. Insufficient permissions.', 403, 'FORBIDDEN');
    }

    next();
  };
};
