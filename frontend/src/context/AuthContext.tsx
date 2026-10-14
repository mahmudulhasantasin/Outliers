"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "user" | "admin";

interface UserProfile {
  name: string;
  email: string;
  role: RoleType;
  organization: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  loginAsDemoUser: () => void;
  loginAsDemoAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("app_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsAuthenticated(true);
        setUser(parsed);
      } catch {
        localStorage.removeItem("app_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const loginAsDemoUser = () => {
    const demoUser: UserProfile = {
      name: "Tariqul Islam",
      email: "tariqul@dhakatech.com",
      role: "user",
      organization: "Dhaka Tech Ventures (SME)",
    };
    setIsAuthenticated(true);
    setUser(demoUser);
    localStorage.setItem("app_auth", JSON.stringify(demoUser));
  };

  const loginAsDemoAdmin = () => {
    const demoAdmin: UserProfile = {
      name: "Advocate Shireen Akhter",
      email: "shireen@supremecourt.bd",
      role: "admin",
      organization: "Supreme Court Chamber / System Admin",
    };
    setIsAuthenticated(true);
    setUser(demoAdmin);
    localStorage.setItem("app_auth", JSON.stringify(demoAdmin));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("app_auth");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginAsDemoUser,
        loginAsDemoAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
