
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUserFromFirebase } from "firebase/auth"; // Firebase Auth user type
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
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
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: any }>;
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
        // Simulate fetching app-specific user profile (including role)
        // In a real app, this would come from Firestore or your backend
        let appUserProfile = mockUsers.find(u => u.email === user.email);

        if (!appUserProfile) {
          // If user registered but not yet in mockUsers (e.g. fresh registration),
          // create a mock profile. This should ideally be created in Firestore upon registration.
          appUserProfile = {
            id: user.uid, // Use Firebase UID
            email: user.email!,
            name: user.displayName || "Nuevo Usuario", // Firebase displayName or default
            role: UserRole.LAWYER, // Default role for new users via public registration
          };
          // Add to mockUsers for this session, ideally this is a DB write.
          const userExistsInMock = mockUsers.some(mu => mu.id === user.uid);
          if (!userExistsInMock) {
             mockUsers.push(appUserProfile);
          }
        } else {
          // Ensure mockUser ID matches Firebase UID if they logged in with an existing mock email
          appUserProfile.id = user.uid;
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

  const register = useCallback(async (name: string, email: string, pass: string, role: UserRole = UserRole.LAWYER): Promise<{ success: boolean; error?: any }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      // User is created in Firebase Auth. Now, create their profile in our system (simulated with mockUsers).
      // In a real app, you'd write this to Firestore.
      const newUserProfile: AppUser = {
        id: fbUser.uid,
        name: name,
        email: email,
        role: role, // Role can be passed, defaults to LAWYER
      };
      // Add to mockUsers if not already there by email (shouldn't be if it's a new Firebase Auth user)
      const userExistsInMock = mockUsers.some(mu => mu.email === email);
      if (!userExistsInMock) {
        mockUsers.push(newUserProfile);
      } else {
        // If email somehow existed in mock but not in Firebase Auth, update the ID.
        const existingMockUser = mockUsers.find(mu => mu.email === email);
        if (existingMockUser) existingMockUser.id = fbUser.uid;
      }

      // onAuthStateChanged will handle setting the current user.
      setIsLoading(false);
      return { success: true };
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
