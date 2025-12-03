"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, doc, collection, query, type DocumentData, type Query, type DocumentReference } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/auth';

// Hook for a single document
export function useDocument<T>(docRef: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe: Unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        setData(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore `useDocument` error:", err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [docRef?.path]); // Re-run effect if document path changes

  return { data, isLoading, error };
}

// Hook for a collection
export function useCollection<T>(q: Query<DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(items);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore `useCollection` error:", err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [q ? JSON.stringify(q) : null]); // A simple way to re-run if query changes. Be careful with complex queries.

  return { data, isLoading, error };
}


// Hook for a collection group
export function useCollectionGroup<T>(collectionId: string | null) {
    const [data, setData] = useState<T[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
  
    useEffect(() => {
      if (!collectionId) {
        setData([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // This is a simplified example. In a real app, you would use collectionGroup from 'firebase/firestore'.
      // This requires a specific index in Firestore.
      // For this prototype, we'll assume a simple collection query is enough.
      // If you need true collectionGroup, the setup is more complex.
      // const q = query(collectionGroup(db, collectionId));

      // This is a placeholder. A real useCollectionGroup needs proper Firestore setup.
      const unsubscribe = () => {}; // No-op
      console.warn("`useCollectionGroup` is not fully implemented and requires Firestore index setup. Using a placeholder.");
      setIsLoading(false);
      
      return () => unsubscribe();
    }, [collectionId]);
  
    return { data, isLoading, error };
  }
