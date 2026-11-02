import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privileges required.',
    });
    return;
  }

  next();
}
