export interface UserProfile {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
