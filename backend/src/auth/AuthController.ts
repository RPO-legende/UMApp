import {
  Body,
  Controller,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Response,
} from "tsoa";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "./authData";
import { RegisterDto, LoginDto, AuthResponse } from "./types";
import { JWT_SECRET } from "./passport";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  
  /**
   * Register a new user
   */
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request")
  @Post("register")
  public async register(@Body() body: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await findUserByEmail(body.email);
    
    if (existingUser) {
      this.setStatus(400);
      throw new Error("User with this email already exists");
    }

    // Validate password
    if (!body.password || body.password.length < 6) {
      this.setStatus(400);
      throw new Error("Password must be at least 6 characters long");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create user in database
    const newUser = await createUser(body.email, body.name, passwordHash);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    this.setStatus(201);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    };
  }

  /**
   * Login with email and password
   */
  @SuccessResponse("200", "OK")
  @Response(401, "Unauthorized")
  @Post("login")
  public async login(@Body() body: LoginDto): Promise<AuthResponse> {
    // Find user
    const user = await findUserByEmail(body.email);
    
    if (!user) {
      this.setStatus(401);
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
    
    if (!isValidPassword) {
      this.setStatus(401);
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
}
