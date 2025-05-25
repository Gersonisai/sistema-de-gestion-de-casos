
"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUserFromFirebase } from "firebase/auth";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { User as AppUser, Organization } from "@/lib/types"; 
import { UserRole } from "@/lib/types";
import { mockUsers, mockOrganizations } from "@/data/mockData";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: AuthUserFromFirebase | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (
    name: string, 
    email: string, 
    pass: string, 
    role?: UserRole, 
    organizationId?: string
  ) => Promise<{ success: boolean; error?: any; newUserId?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
  isSecretary: boolean; // New property
  registerOrganizationAdmin: (
    organizationName: string,
    adminName: string,
    adminEmail: string,
    adminPass: string,
    plan: Organization['plan']
  ) => Promise<{ success: boolean; error?: any; newUserId?: string, newOrgId?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<AuthUserFromFirebase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        let appUserProfile = mockUsers.find(u => u.id === fbUser.uid);

        if (!appUserProfile) {
          appUserProfile = mockUsers.find(u => u.email === fbUser.email);
          if (appUserProfile) {
            appUserProfile.id = fbUser.uid; 
          }
        }
        
        if (appUserProfile) {
          appUserProfile.name = fbUser.displayName || appUserProfile.name;
          appUserProfile.email = fbUser.email!;
          // Ensure organizationId is correctly assigned if user is part of an org
          if (!appUserProfile.organizationId && fbUser.uid === "Uh8GnPZnGkNVpEqXwsPJJtTc8R63") { // Hardcoded System Admin
             appUserProfile.organizationId = "org_default_admin";
          }
          setCurrentUser(appUserProfile);
        } else {
           console.warn(`User ${fbUser.email} authenticated via Firebase but not found in mockData. Creating a default profile.`);
           const fallbackProfile: AppUser = {
            id: fbUser.uid,
            email: fbUser.email!,
            name: fbUser.displayName || "Usuario YASI K'ARI",
            role: UserRole.LAWYER, // Default new registrations to Lawyer if not specified or matched
            // organizationId might be undefined here, should be set during specific registration flows.
          };
          setCurrentUser(fallbackProfile);
          if (!mockUsers.some(mu => mu.id === fbUser.uid)) {
             mockUsers.push(fallbackProfile);
          }
        }
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

  const register = useCallback(async (
    name: string, 
    email: string, 
    pass: string, 
    role: UserRole = UserRole.LAWYER, 
    organizationId?: string 
  ): Promise<{ success: boolean; error?: any; newUserId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: name });
      
      let appUserProfile = mockUsers.find(u => u.id === fbUser.uid || u.email === email);
      if (appUserProfile) { 
        appUserProfile.id = fbUser.uid;
        appUserProfile.name = name;
        appUserProfile.role = role;
        appUserProfile.organizationId = organizationId || appUserProfile.organizationId;
      } else { 
        appUserProfile = { 
          id: fbUser.uid, 
          name, 
          email, 
          role, 
          organizationId 
        };
        mockUsers.push(appUserProfile);
      }
      
      setCurrentUser(appUserProfile); 
      setFirebaseUser(fbUser);

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
    plan: Organization['plan']
  ): Promise<{ success: boolean; error?: any; newUserId?: string, newOrgId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: adminName });

      const newOrgId = `org-${Date.now().toString().slice(-6)}`;
      const newOrganization: Organization = {
        id: newOrgId,
        name: organizationName,
        ownerId: fbUser.uid,
        plan: plan,
        themePalette: "default",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockOrganizations.push(newOrganization);

      const adminProfile: AppUser = {
        id: fbUser.uid,
        name: adminName,
        email: adminEmail,
        role: UserRole.ADMIN,
        organizationId: newOrgId,
      };
      
      const existingUserIndex = mockUsers.findIndex(u => u.email === adminEmail);
      if (existingUserIndex > -1) mockUsers.splice(existingUserIndex, 1);
      mockUsers.push(adminProfile);
      
      setCurrentUser(adminProfile); 
      setFirebaseUser(fbUser);

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
      router.push("/"); 
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const isAuthenticated = !!currentUser && !!firebaseUser;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isLawyer = currentUser?.role === UserRole.LAWYER;
  const isSecretary = currentUser?.role === UserRole.SECRETARY;

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
        isSecretary, // New property
        registerOrganizationAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
