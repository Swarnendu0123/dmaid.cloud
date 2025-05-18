import {User} from '../db/schema/index'; // adjust path to your user model
import { NextFunction,Response,Request } from 'express';

interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  name?:  string;
}

export const authenticateUser= async (req:AuthRequest, res:Response, next :NextFunction) => {
  try {
    const token = req.cookies?.authToken;
    console.log(token);
    if (!token) {
       res.status(401).json({ error: 'Authentication token missing' });
       return
    }

    const user = await User.findOne({ currentToken: token }).exec();

    if (!user || user.currentToken !== token) {
       res.status(403).json({ error: 'Invalid token or user not found' });
       return
    }

    req.userId = user.id;
    req.email = user.email;
    req.name = user.name

    next(); // Proceed to the route
  } catch (error: any) {
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};
