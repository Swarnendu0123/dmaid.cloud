import { Request, Response, NextFunction } from 'express';
import {User} from '../db/schema/index'; // adjust path to your user model

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const userId = req.headers['x-user-id']; // assuming frontend also sends user ID in custom header

    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ error: 'User ID missing from headers' });
    }

    const user = await User.findById(userId).exec();

    if (!user || user.currentToken !== token) {
      return res.status(403).json({ error: 'Invalid token or user not found' });
    }

    // Optional: attach user info to request
    req.userId = user.id;

    next(); // Proceed to the route
  } catch (error: any) {
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};
