import {
  Body,
  Controller,
  Get,
  Route,
  Tags,
  Request,
  Security,
} from "tsoa";
import { UserProfile } from "../auth/types";

interface ProfileResponse {
  id: number;
  email: string;
  name: string;
}

// Extend the Express Request type
declare module "express-serve-static-core" {
  interface Request {
    user?: UserProfile;
  }
}

@Route("profile")
@Tags("Profile")
export class ProfileController extends Controller {
  
  /**
   * Get current user profile - requires JWT authentication
   * @example request headers {"Authorization": "Bearer <token>"}
   */
  @Get("me")
  @Security("jwt")
  public async getCurrentUser(@Request() request: any): Promise<ProfileResponse> {
    const user = request.user;

    if (!user) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
