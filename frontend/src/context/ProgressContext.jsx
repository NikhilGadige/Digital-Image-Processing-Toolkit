/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { moduleCatalog } from '../data/modules';

const LOCAL_PROGRESS_KEY = 'dip_local_progress_v2';
const ProgressContext = createContext(null);
const USER_COLLECTION = 'users';

function dedupe(items) {
  return Array.from(new Set(items));
}

function readLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ProgressProvider({ children }) {
  const { user, firebaseReady } = useAuth();
  const [completedModules, setCompletedModules] = useState(readLocalProgress());
  const [syncing, setSyncing] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [syncError, setSyncError] = useState('');
  const skipNextRemoteWriteRef = useRef(false);

  useEffect(() => {
    if (!user || !firebaseReady) {
      setRemoteLoaded(false);
      setCompletedModules(readLocalProgress());
      return;
    }

    const loadRemote = async () => {
      setSyncing(true);
      setSyncError('');
      try {
        const local = readLocalProgress();
        const progressRef = doc(db, USER_COLLECTION, user.uid);
        const snap = await getDoc(progressRef);
        const remote = snap.exists() ? snap.data().completedModules || [] : [];
        const merged = dedupe([...remote, ...local]);

        skipNextRemoteWriteRef.current = true;
        setCompletedModules(merged);

        // Ensure remote is initialized/updated, and clear stale guest data post-merge.
        await setDoc(
          progressRef,
          { completedModules: merged, updatedAt: serverTimestamp(), email: user.email || null },
          { merge: true },
        );
        localStorage.removeItem(LOCAL_PROGRESS_KEY);
      } catch (error) {
        console.error('Failed to load/merge remote progress:', error);
        setSyncError(error.message || 'Failed to load progress from Firestore.');
      } finally {
        setSyncing(false);
        setRemoteLoaded(true);
      }
    };

    loadRemote();
  }, [firebaseReady, user]);

  useEffect(() => {
    if (user || syncing) return;
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(completedModules));
  }, [completedModules, syncing, user]);

  useEffect(() => {
    if (!user || !firebaseReady || syncing || !remoteLoaded) return;
    if (skipNextRemoteWriteRef.current) {
      skipNextRemoteWriteRef.current = false;
      return;
    }

    const save = async () => {
      try {
        await setDoc(
          doc(db, USER_COLLECTION, user.uid),
          { completedModules, updatedAt: serverTimestamp(), email: user.email || null },
          { merge: true },
        );
        setSyncError('');
      } catch (error) {
        console.error('Failed to save remote progress:', error);
        setSyncError(error.message || 'Failed to save progress to Firestore.');
      }
    };

    void save();
  }, [completedModules, firebaseReady, remoteLoaded, syncing, user]);

  const markCompleted = useCallback((moduleId) => {
    setCompletedModules((current) => dedupe([...current, moduleId]));
  }, []);

  const unmarkCompleted = useCallback((moduleId) => {
    setCompletedModules((current) => current.filter((item) => item !== moduleId));
  }, []);

  const clearLocalProgress = () => {
    localStorage.removeItem(LOCAL_PROGRESS_KEY);
    setCompletedModules([]);
  };

  const progressPercent = Math.round((completedModules.length / moduleCatalog.length) * 100);

  const value = useMemo(
    () => ({
      completedModules,
      progressPercent,
      markCompleted,
      unmarkCompleted,
      clearLocalProgress,
      syncing,
      syncError,
    }),
    [completedModules, markCompleted, progressPercent, syncError, syncing, unmarkCompleted],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}
