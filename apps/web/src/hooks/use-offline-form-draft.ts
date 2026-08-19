"use client";

import { useEffect, useState } from "react";

export function useOfflineFormDraft<T>(key: string, initialState: T) {
  const [formState, setFormState] = useState<T>(initialState);
  const [hasDraft, setHasDraft] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setHasDraft(true);
        }
      }
    } catch {
      // Storage unavailable
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [key]);

  const saveDraft = (data: T) => {
    setFormState(data);
    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify(data));
      setHasDraft(true);
    } catch {
      // Storage failed
    }
  };

  const restoreDraft = (): T | null => {
    try {
      const saved = localStorage.getItem(`draft_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        setFormState(parsed);
        return parsed;
      }
    } catch {
      // Storage read failed
    }
    return null;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(`draft_${key}`);
      setHasDraft(false);
    } catch {
      // Ignore
    }
  };

  return {
    formState,
    setFormState: saveDraft,
    hasDraft,
    restoreDraft,
    clearDraft,
    isOffline,
  };
}
