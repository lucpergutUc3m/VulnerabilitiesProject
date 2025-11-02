export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
