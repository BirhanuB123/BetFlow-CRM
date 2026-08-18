"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

type BrandingContextType = {
  systemName: string;
  updateSystemName: (name: string) => void;
  refreshBranding: () => Promise<void>;
};

const DEFAULT_SYSTEM_NAME = "BetFlow CRM";

const BrandingContext = createContext<BrandingContextType>({
  systemName: DEFAULT_SYSTEM_NAME,
  updateSystemName: () => {},
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [systemName, setSystemName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        window.localStorage.getItem("betflow_system_name") ||
        DEFAULT_SYSTEM_NAME
      );
    }
    return DEFAULT_SYSTEM_NAME;
  });

  const updateSystemName = useCallback((name: string) => {
    const trimmed = name.trim() || DEFAULT_SYSTEM_NAME;
    setSystemName(trimmed);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("betflow_system_name", trimmed);
    }
  }, []);

  const refreshBranding = useCallback(async () => {
    try {
      const tenant = await apiFetch<{ name?: string }>("/tenants");
      if (tenant?.name) {
        updateSystemName(tenant.name);
        return;
      }
    } catch {
      // Ignore endpoint failures
    }

    try {
      const data = await apiFetch<Array<{ id: string; value: string }>>(
        "/saas/branding",
      );
      if (Array.isArray(data)) {
        const nameSetting = data.find(
          (item) => item.id === "brand_name" || item.id === "system_name",
        );
        if (nameSetting?.value) {
          updateSystemName(nameSetting.value);
        }
      }
    } catch {
      // Fallback to default or cached localStorage value
    }
  }, [updateSystemName]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshBranding();
    });
  }, [refreshBranding]);

  const value = useMemo(
    () => ({
      systemName,
      updateSystemName,
      refreshBranding,
    }),
    [systemName, updateSystemName, refreshBranding],
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
