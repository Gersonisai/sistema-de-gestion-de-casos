"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { mockUsers } from "@/data/mockData";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage or a session
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem("currentUser");
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Mock authentication: in a real app, this would be an API call
    // For this mock, we just check against mockUsers.
    // Password 'password' for all mock users.
    const user = mockUsers.find((u) => u.email === email);

    if (user && pass === "password") {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    router.push("/login");
  }, [router]);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isLawyer = currentUser?.role === UserRole.LAWYER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        isAdmin,
        isLawyer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
