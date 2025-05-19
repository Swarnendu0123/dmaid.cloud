export {}

declare global {
  namespace Express {
    export interface Request {
      email: string;
      userId?: string;
    }
  }
}