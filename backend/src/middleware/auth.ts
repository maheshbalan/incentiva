import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { prisma } from '../index';
import { UserRole } from '@incentiva/shared';
import { createError } from './errorHandler';
import { User as PrismaUser } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: PrismaUser;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireParticipant = requireRole([UserRole.PARTICIPANT]);
export const requireAnyRole = requireRole([UserRole.ADMIN, UserRole.PARTICIPANT]);

// OAuth middleware
export const authenticateGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const authenticateMicrosoft = passport.authenticate('microsoft', {
  scope: ['user.read']
});

export const handleOAuthCallback = (provider: string) => {
  return passport.authenticate(provider, { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        error: 'OAuth authentication failed'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    });
  });
}; 