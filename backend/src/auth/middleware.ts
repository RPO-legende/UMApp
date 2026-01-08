import { Request, Response, NextFunction } from "express";
import { passport } from "./passport";
import { AuthUser } from "./types";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Middleware to protect routes with JWT
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: AuthUser, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};
