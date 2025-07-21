"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "@/kyClient/auth";
import { User } from "@/kyClient/constants";

interface LoginInfo {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ message: string }>;
  verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ token: string; user: User; password_updated: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  loginInfo: LoginInfo | null;
  setLoginInfo: (info: LoginInfo) => void;
  verifyPassword: (password: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);
  // Removed: const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        const accessToken = localStorage.getItem("access_token");

        // Only set user state, do not navigate here
        if (currentUser && accessToken) {
          setUser(currentUser);

        } else {
          authService.logout();
          setUser(null);
          window.location.href = "/sign-in";
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPassword = async (password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyPassword(password);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      return await authService.verifyOtp(email, otp);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = "/sign-in";

    // Removed: navigate({ to: "/sign-in" });
  };

  const value = {
    user,
    isLoading,
    login,
    verifyOtp,
    logout,
    isAuthenticated: !!user,
    loginInfo,
    setLoginInfo,
    verifyPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
