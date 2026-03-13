/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, firebaseReady } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return () => {};
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      firebaseReady,
      signUp: async (email, password) => {
        if (!firebaseReady) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables.');
        return createUserWithEmailAndPassword(auth, email, password);
      },
      signIn: async (email, password) => {
        if (!firebaseReady) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables.');
        return signInWithEmailAndPassword(auth, email, password);
      },
      signOutUser: async () => {
        if (!firebaseReady) return;
        return signOut(auth);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
