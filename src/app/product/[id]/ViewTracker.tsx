"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ViewTracker({ productId }: { productId: string }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(async () => {
      try {
        const viewRef = doc(db, `users/${user.uid}/viewHistory`, productId);
        await setDoc(viewRef, {
          productId,
          viewedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.error("Failed to record view", error);
      }
    }, 3000); // 3 seconds threshold

    return () => clearTimeout(timer);
  }, [productId, user]);

  return null; // This component does not render anything
}
