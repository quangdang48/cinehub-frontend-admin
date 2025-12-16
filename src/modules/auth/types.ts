export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthState {
  success: boolean;
  error?: string;
}
