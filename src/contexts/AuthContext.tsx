
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUserFromFirebase } from "firebase/auth";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { User as AppUser, Organization } from "@/lib/types"; 
import { UserRole } from "@/lib/types";
import { mockUsers, mockOrganizations } from "@/data/mockData"; // Import mockOrganizations
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: AuthUserFromFirebase | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: any; newUserId?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
  // New function for organization admin registration
  registerOrganizationAdmin: (
    organizationName: string,
    adminName: string,
    adminEmail: string,
    adminPass: string,
    plan: string
  ) => Promise<{ success: boolean; error?: any; newUserId?: string, newOrgId?: string }>;
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
        // Try to find user in mockUsers by UID first, then by email as a fallback
        let appUserProfile = mockUsers.find(u => u.id === user.uid) || mockUsers.find(u => u.email === user.email);

        if (appUserProfile) {
          // User found in mockData
          appUserProfile.id = user.uid; // Ensure ID is Firebase UID
          appUserProfile.name = user.displayName || appUserProfile.name; // Prefer Firebase displayName
          appUserProfile.email = user.email!; // Ensure email is from Firebase
        } else {
          // User exists in Firebase Auth but not in mockData.
          // This case becomes less likely if all registrations go through our app flows.
          // For now, create a temporary profile. In a real multi-tenant app, this user would belong to an org.
          console.warn(`User ${user.email} authenticated via Firebase but not found in mockData. Assigning LAWYER role.`);
          appUserProfile = {
            id: user.uid,
            email: user.email!,
            name: user.displayName || "Usuario Firebase",
            role: UserRole.LAWYER, // Default, might need to be more specific based on context
            // organizationId: undefined, // Or a default org if applicable
          };
           // Add to mockUsers if truly new
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
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Old public register function - might be deprecated or used for lawyer invites later
  const register = useCallback(async (name: string, email: string, pass: string, role: UserRole = UserRole.LAWYER, organizationId?: string): Promise<{ success: boolean; error?: any; newUserId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: name });
      
      let appUserProfile = mockUsers.find(u => u.email === email);
      if (appUserProfile) {
        appUserProfile.id = fbUser.uid;
        appUserProfile.name = name;
        appUserProfile.role = role;
        appUserProfile.organizationId = organizationId;
      } else {
        appUserProfile = { id: fbUser.uid, name, email, role, organizationId };
        mockUsers.push(appUserProfile);
      }
      setIsLoading(false);
      return { success: true, newUserId: fbUser.uid };
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      setIsLoading(false);
      return { success: false, error: error };
    }
  }, []);

  const registerOrganizationAdmin = useCallback(async (
    organizationName: string,
    adminName: string,
    adminEmail: string,
    adminPass: string,
    plan: string // Plan info can be used later for feature flagging etc.
  ): Promise<{ success: boolean; error?: any; newUserId?: string, newOrgId?: string }> => {
    setIsLoading(true);
    try {
      // 1. Create the admin user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: adminName });

      // 2. Simulate creating the organization in mockData
      const newOrgId = `org-${Date.now()}`;
      const newOrganization: Organization = {
        id: newOrgId,
        name: organizationName,
        ownerId: fbUser.uid, // The admin is the owner
        plan: plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockOrganizations.push(newOrganization);

      // 3. Create the admin user profile in mockUsers, linking to the organization
      const adminProfile: AppUser = {
        id: fbUser.uid,
        name: adminName,
        email: adminEmail,
        role: UserRole.ADMIN, // This user is an ADMIN of their organization
        organizationId: newOrgId,
      };
      mockUsers.push(adminProfile);
      
      console.log("New organization (simulated):", newOrganization);
      console.log("New admin profile (simulated):", adminProfile);

      setIsLoading(false);
      return { success: true, newUserId: fbUser.uid, newOrgId: newOrgId };
    } catch (error: any) {
      console.error("Firebase organization admin registration error:", error);
      setIsLoading(false);
      return { success: false, error: error };
    }
  }, []);


  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push("/subscribe"); // Redirect to subscribe page on logout
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const isAuthenticated = !!currentUser && !!firebaseUser;
  // isAdmin and isLawyer might need to be more nuanced in a multi-tenant app
  // e.g. isAdmin could mean "is admin of *their* organization"
  // For now, it refers to the UserRole.ADMIN
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
        registerOrganizationAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
