import { auth, googleProvider, db, isMockMode } from './firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signInWithGoogle = async () => {
  if (isMockMode) {
    const mockUser = {
      uid: 'mock-user-id',
      email: 'demo@shopsense.app',
      displayName: 'Demo User',
      photoURL: 'https://picsum.photos/seed/user/100',
    } as User;
    
    document.cookie = `auth-token=mock-token; path=/`;
    return mockUser;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: false,
        createdAt: serverTimestamp(),
      });
    }
    
    document.cookie = `auth-token=${await user.getIdToken()}; path=/`;
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async () => {
  if (!isMockMode) {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isMockMode) {
    // If mock token exists in cookies, mock the user
    const hasMockToken = document.cookie.includes('auth-token=mock-token');
    if (hasMockToken) {
      callback({
        uid: 'mock-user-id',
        email: 'demo@shopsense.app',
        displayName: 'Demo User',
        photoURL: 'https://picsum.photos/seed/user/100',
      } as User);
    } else {
      callback(null);
    }
    return () => {}; // empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};
