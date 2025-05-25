
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
    organizationId?: string // Added to associate user with an org
  ) => Promise<{ success: boolean; error?: any; newUserId?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
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
          // If not found by UID, try by email (e.g. first login for a pre-defined mock user)
          appUserProfile = mockUsers.find(u => u.email === fbUser.email);
          if (appUserProfile) {
            appUserProfile.id = fbUser.uid; // Update mock user's ID to Firebase UID
          }
        }
        
        if (appUserProfile) {
          appUserProfile.name = fbUser.displayName || appUserProfile.name;
          appUserProfile.email = fbUser.email!;
          setCurrentUser(appUserProfile);
        } else {
          // User exists in Firebase Auth but not in mockData (e.g., registered via invitation to a new org)
          // This case should ideally be handled by the register function adding to mockUsers.
          // If they still end up here, it's a fallback.
           console.warn(`User ${fbUser.email} authenticated via Firebase but not found in mockData. This shouldn't happen if registration flow is correct.`);
           // For safety, assign a default profile, but this indicates a potential gap if `organizationId` is missing.
           const fallbackProfile: AppUser = {
            id: fbUser.uid,
            email: fbUser.email!,
            name: fbUser.displayName || "Usuario Firebase",
            role: UserRole.LAWYER, // Default role for unexpected users
            // organizationId will be undefined here, which might cause issues.
            // The registration flow (invited or org admin) should ensure organizationId is set.
          };
          setCurrentUser(fallbackProfile);
          if (!mockUsers.some(mu => mu.id === fbUser.uid)) { // Add if truly new and missed by register flows
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
      // onAuthStateChanged will handle setting the user
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
    role: UserRole = UserRole.LAWYER, // Default to LAWYER
    organizationId?: string // Optional: for invited users or direct admin creation
  ): Promise<{ success: boolean; error?: any; newUserId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: name });
      
      // Create or update user profile in mockUsers
      let appUserProfile = mockUsers.find(u => u.id === fbUser.uid || u.email === email);
      if (appUserProfile) { // Update existing mock user (e.g. if email matched a placeholder)
        appUserProfile.id = fbUser.uid;
        appUserProfile.name = name;
        appUserProfile.role = role;
        appUserProfile.organizationId = organizationId || appUserProfile.organizationId; // Preserve orgId if already set
      } else { // Add new user to mockUsers
        appUserProfile = { 
          id: fbUser.uid, 
          name, 
          email, 
          role, 
          organizationId 
        };
        mockUsers.push(appUserProfile);
      }
      
      // If this user is an admin and their organization is "org_default_admin" (our system admin mock)
      // ensure it's properly set, mostly for the initial admin@lexcase.com setup.
      if (email === 'admin@lexcase.com' && role === UserRole.ADMIN) {
        const sysAdminOrg = mockOrganizations.find(o => o.id === 'org_default_admin');
        if (sysAdminOrg) {
            appUserProfile.organizationId = sysAdminOrg.id;
        }
      }

      setCurrentUser(appUserProfile); // Set current user immediately after registration for better UX
      setFirebaseUser(fbUser); // Also set firebaseUser

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
      
      // Ensure this new admin is also in mockUsers
      // Remove if exists by email (e.g. if admin@lexcase.com was a placeholder) then add fresh
      const existingUserIndex = mockUsers.findIndex(u => u.email === adminEmail);
      if (existingUserIndex > -1) mockUsers.splice(existingUserIndex, 1);
      mockUsers.push(adminProfile);
      
      setCurrentUser(adminProfile); // Set current user to the new admin
      setFirebaseUser(fbUser);    // Also set firebaseUser

      console.log("New organization (simulated):", newOrganization);
      console.log("New admin profile (simulated):", adminProfile);

      setIsLoading(false);
      return { success: true, newUserId: fbUser.uid, newOrgId: newOrgId };
    } catch (error: any)
{
      console.error("Firebase organization admin registration error:", error);
      setIsLoading(false);
      return { success: false, error: error };
    }
  }, []);


  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // setCurrentUser and setFirebaseUser will be set to null by onAuthStateChanged
      router.push("/"); // Redirect to landing page on logout
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
        registerOrganizationAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
