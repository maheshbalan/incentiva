import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { prisma } from '../index';
import { UserRole } from '@incentiva/shared';
import { createError } from './errorHandler';

// Define a User interface that matches our Prisma schema
interface PrismaUser {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  oauthProvider: string | null;
  oauthId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: PrismaUser;
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Type assertion to add user to request
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    return;
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
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
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, { session: false }, (err: any, user: any) => {
      if (err || !user) {
        res.status(401).json({
          success: false,
          error: 'OAuth authentication failed'
        });
        return;
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
    })(req, res, next);
  };
}; 