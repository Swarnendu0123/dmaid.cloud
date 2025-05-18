import 'index';
declare global {
  namespace Express {
    interface Request {
      userId?: string; // or Types.ObjectId if you prefer
      email?: string;
      name?: string;
    }
  }
}
