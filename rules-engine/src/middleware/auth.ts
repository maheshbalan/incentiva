import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    
    try {
      const decoded = jwt.verify(token, secret) as any;
      
      // Verify user exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw createError('User not found', 401);
      }

      req.user = user;
      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token:', { token: token.substring(0, 10) + '...' });
      throw createError('Invalid or expired token', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      if (!roles.includes(req.user.role)) {
        logger.warn('Insufficient permissions:', {
          user: req.user.email,
          role: req.user.role,
          requiredRoles: roles,
          endpoint: req.originalUrl
        });
        throw createError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireParticipant = requireRole(['PARTICIPANT', 'ADMIN']);
