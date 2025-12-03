"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User as AuthUserFromFirebase } from "firebase/auth";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { User as AppUser, Organization } from "@/lib/types"; 
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
    organizationId?: string,
    extraData?: Partial<AppUser>
  ) => Promise<{ success: boolean; error?: any; newUserId?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isLawyer: boolean;
  isSecretary: boolean;
  isClient: boolean;
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() } as AppUser);
        } else {
          console.warn(`User ${fbUser.email} authenticated but no profile found in Firestore. This might happen during registration.`);
          // User might be in the process of registering, wait for register function to create doc.
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
      // onAuthStateChanged will handle setting the user state
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
    organizationId?: string,
    extraData: Partial<AppUser> = {}
  ): Promise<{ success: boolean; error?: any; newUserId?: string }> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: name });
      
      const newUserProfile: AppUser = { 
        id: fbUser.uid, 
        name, 
        email, 
        role, 
        organizationId,
        ...extraData,
      };

      await setDoc(doc(db, "users", fbUser.uid), newUserProfile);
      
      setCurrentUser(newUserProfile); 
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

      const newOrgId = `org_${Date.now().toString().slice(-6)}`;
      
      const adminProfile: AppUser = {
        id: fbUser.uid,
        name: adminName,
        email: adminEmail,
        role: UserRole.ADMIN,
        organizationId: newOrgId,
      };
      await setDoc(doc(db, "users", fbUser.uid), adminProfile);

      const newOrganization: Omit<Organization, 'id'> = {
        name: organizationName,
        ownerId: fbUser.uid,
        plan: plan,
        themePalette: "default",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };
      await setDoc(doc(db, "organizations", newOrgId), newOrganization);
      
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
      // onAuthStateChanged handles state cleanup
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
  const isClient = currentUser?.role === UserRole.CLIENT;

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
        isSecretary,
        isClient,
        registerOrganizationAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
