import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI, AuthOut } from "../api/AuthService";
import {
  getToken,
  setRefreshToken,
  setToken,
  getRefreshToken,
} from "../api/HttpService";

type User = {
  id: string;
  email: string;
  name: string;
  profile_pic?: string;
  gender?: string;
  is_admin?: number;
};

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthOut>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthData: (res: AuthOut) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const applyAuth = (res: AuthOut) => {
    setToken(res.access_token);
    setTok(res.access_token);
    setUser(res.user);
    setRefreshToken(res.refresh_token);
  };

  const login = async (email: string, password: string) => {
    const res = await AuthAPI.login({ email, password });
    applyAuth(res);
    return res;
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await AuthAPI.signup({ name, email, password });
    applyAuth(res);
  };

  const logout = () => {
    setToken(null);
    setTok(null);
    setUser(null);
    setRefreshToken(null);
  };

  const setAuthData = (res: AuthOut) => {
    applyAuth(res);
  };

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        setLoading(true);
        const me = await AuthAPI.user().catch(() => null);
        if (me) setUser(me);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        signup,
        logout,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
