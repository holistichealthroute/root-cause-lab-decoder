import { get, post } from "./HttpService";

export type AuthOut = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
};
type User = {
  id: string;
  email: string;
  name: string;
  profile_pic?: string;
  gender: string;
  is_admin?: number;
};

export const AuthAPI = {
  signup: (p: { name: string; email: string; password: string }) =>
    post<AuthOut>("/auth/signup", p),

  login: (p: { email: string; password: string }) =>
    post<AuthOut>("/auth/login", p),

  forgotPassword: (email: string) =>
    post<{ ok: true }>("/auth/forgot-password", { email }),

  resetPassword: (p: { token: string; new_password: string }) =>
    post<{ ok: true }>("/auth/reset-password", p),

  user: () => get<User>("/auth/user"),
};
