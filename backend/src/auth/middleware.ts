import { Request, Response, NextFunction } from "express";
import { passport } from "./passport";
import { UserProfile } from "./types";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends UserProfile {}
  }
}

// Middleware to protect routes with JWT
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: UserProfile, info: any) => {
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

// TSOA authentication handler
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    return new Promise((resolve, reject) => {
      passport.authenticate("jwt", { session: false }, (err: any, user: UserProfile, info: any) => {
        if (err) {
          return reject(err);
        }
        
        if (!user) {
          return reject(new Error("Unauthorized"));
        }
        
        // Attach user to request object
        request.user = user;
        
        resolve(user);
      })(request, {} as Response, () => {});
    });
  }
  
  throw new Error("Unknown security name: " + securityName);
}
