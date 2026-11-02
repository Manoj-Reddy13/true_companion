import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { verifyToken } from '../utils/token.js';
import { UserRepo } from '../services/dataService.js';

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await UserRepo.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid session. User not found.' });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({
        success: false,
        message: 'This account has been permanently banned due to community guidelines violation.',
      });
      return;
    }

    if (user.status === 'suspended') {
      if (user.suspensionUntil && new Date(user.suspensionUntil) > new Date()) {
        res.status(403).json({
          success: false,
          message: `Account suspended until ${new Date(user.suspensionUntil).toLocaleDateString()} for guideline violations.`,
        });
        return;
      } else {
        // Suspension period has elapsed, restore account
        await UserRepo.update(user._id, { status: 'active', suspensionUntil: undefined });
        user.status = 'active';
      }
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await UserRepo.findById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
}
