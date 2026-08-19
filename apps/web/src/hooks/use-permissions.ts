"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { UserPermissionItem } from "@betflow/shared";

type ProfileResponse = {
  user?: {
    id?: string;
    roles?: string[];
    permissions?: UserPermissionItem[];
  };
  roles?: string[];
  permissions?: UserPermissionItem[];
};

const MODULE_MAP: Record<string, string[]> = {
  "Sales & Pipeline": [
    "sales & pipeline",
    "crm",
    "sales",
    "leads",
    "deals",
    "customers",
  ],
  "Activities & Engagement": [
    "activities & engagement",
    "activities",
    "engagement",
    "crm",
    "tasks",
    "meetings",
    "calls",
    "visits",
  ],
  "Property Inventory": [
    "property inventory",
    "inventory",
    "properties",
    "projects",
    "units",
  ],
  "Transactions & Finance": [
    "transactions & finance",
    "finance",
    "transactions",
    "payments",
    "contracts",
    "reservations",
  ],
  "Marketing & Automation": [
    "marketing & automation",
    "marketing",
    "automation",
    "campaigns",
  ],
  "System & Assets": [
    "system & assets",
    "system",
    "assets",
    "users",
    "rbac",
    "documents",
  ],
};

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissionItem[] | null>(
    null,
  );
  const [roles, setRoles] = useState<string[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check stored session initially for fast UI hydration
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("betflow-auth") ??
            window.sessionStorage.getItem("betflow-auth")
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const userData = parsed.user || parsed;
        if (userData?.permissions) {
          setPermissions(userData.permissions);
        }
        if (userData?.roles) {
          setRoles(userData.roles);
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Fetch current authenticated user profile with permissions from /auth/me
    apiFetch<ProfileResponse>("/auth/me")
      .then((res) => {
        if (!isMounted) return;
        const userObj = res?.user || res;
        if (userObj?.permissions) {
          setPermissions(userObj.permissions);
        }
        if (userObj?.roles) {
          setRoles(userObj.roles);
        }
        setLoaded(true);
      })
      .catch(() => {
        // Fail open policy: set loaded to true with null permissions
        if (isMounted) {
          setLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isAdminOrOwner = useMemo(() => {
    if (!roles || roles.length === 0) return false;
    return roles.some((r) => {
      const lower = r.toLowerCase();
      return (
        lower.includes("admin") ||
        lower.includes("owner") ||
        lower.includes("super")
      );
    });
  }, [roles]);

  const hasModulePermission = useCallback(
    (sectionTitle: string): boolean => {
      // Fail open: if permissions couldn't be loaded or resolved, allow access
      if (!loaded && permissions === null && roles === null) {
        return true;
      }

      // If user is Admin or Owner, allow access to all sections
      if (isAdminOrOwner) {
        return true;
      }

      // If permissions list is null/undefined or empty, fail open
      if (!permissions || permissions.length === 0) {
        return true;
      }

      const targetModules = MODULE_MAP[sectionTitle] || [
        sectionTitle.toLowerCase(),
      ];

      // Check if user has any permission matching the section or target modules
      return permissions.some((p) => {
        const permModule = (p.module || "").toLowerCase();
        const permName = (p.name || "").toLowerCase();
        return targetModules.some(
          (mod) =>
            permModule === mod ||
            permModule.includes(mod) ||
            permName.startsWith(mod),
        );
      });
    },
    [permissions, roles, loaded, isAdminOrOwner],
  );

  return {
    permissions,
    roles,
    loaded,
    isAdminOrOwner,
    hasModulePermission,
  };
}
