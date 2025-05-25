
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUserFromFirebase } from "firebase/auth"; // Firebase Auth user type
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Your Firebase auth instance
import type { User as AppUser } from "@/lib/types"; // Your app's User type
import { UserRole } from "@/lib/types";
import { mockUsers } from "@/data/mockData"; // For mock profile data including roles
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: AppUser | null; // Use your app's User type
  firebaseUser: AuthUserFromFirebase | null; // Keep Firebase Auth user for direct access if needed
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: any; newUserId?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<AuthUserFromFirebase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        let appUserProfile = mockUsers.find(u => u.email === user.email);

        if (appUserProfile) {
          // User found in mockData, update their ID to Firebase UID
          // and ensure name is consistent (Firebase displayName might be more up-to-date if set)
          appUserProfile.id = user.uid;
          // Prefer Firebase displayName if available and different, otherwise keep mockData name
          appUserProfile.name = (user.displayName && user.displayName !== appUserProfile.name) ? user.displayName : appUserProfile.name;
        } else {
          // User exists in Firebase Auth but not in mockData (e.g., created directly in Firebase console or new public registration not yet in mockData)
          // Create a temporary profile for this session
          console.warn(`User ${user.email} authenticated via Firebase but not found in mockData. Creating temporary profile with LAWYER role.`);
          appUserProfile = {
            id: user.uid,
            email: user.email!,
            name: user.displayName || "Usuario Firebase", // Use Firebase displayName or a default
            role: UserRole.LAWYER, // Default role for users not in mockData
          };
          // Only add to mockUsers if it's truly a new profile not yet tracked
          if (!mockUsers.some(mu => mu.id === user.uid)) {
            mockUsers.push(appUserProfile); 
          }
        }
        setCurrentUser(appUserProfile);
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string, role: UserRole = UserRole.LAWYER): Promise<{ success: boolean; error?: any; newUserId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // Update Firebase profile with display name
      await updateProfile(fbUser, { displayName: name });
      
      // Manage user profile in mockUsers
      let appUserProfile = mockUsers.find(u => u.email === email);
      if (appUserProfile) {
        // Email already exists in mockData, update its details
        appUserProfile.id = fbUser.uid;
        appUserProfile.name = name; // Update name from registration form
        appUserProfile.role = role; // Update role from registration
      } else {
        // New email, create new profile in mockData
        appUserProfile = {
          id: fbUser.uid,
          name: name,
          email: email,
          role: role,
        };
        mockUsers.push(appUserProfile);
      }
      // Note: onAuthStateChanged will also fire and set the currentUser.

      setIsLoading(false);
      return { success: true, newUserId: fbUser.uid };
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      setIsLoading(false);
      return { success: false, error: error };
    }
  }, []);


  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle clearing the user
      router.push("/login");
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const isAuthenticated = !!currentUser && !!firebaseUser;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isLawyer = currentUser?.role === UserRole.LAWYER;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isLawyer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
