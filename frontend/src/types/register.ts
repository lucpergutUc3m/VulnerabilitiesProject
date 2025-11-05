export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
  expiresIn: number;
}
