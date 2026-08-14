"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Check,
  Edit2,
  Plus,
  RotateCw,
  Save,
  ShieldAlert,
  Trash2,
  X,
  User as UserIcon,
  UserCheck,
  Settings2,
  Building2,
  KeyRound,
  ShieldCheck,
  Users,
  Lock,
  Globe,
  Sparkles,
  CreditCard,
  FileCheck,
  Palette,
  Database,
  Flag,
  UploadCloud,
  History,
  CheckCircle2,
  Mail,
  ArrowRight,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { apiFetch, updateSessionCurrency } from "@/lib/api";
import { CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
  domain: string | null;
  region: string;
  plan: string;
  status: string;
  currency: string;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissionKeys: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  roleName?: string;
  status: string;
  createdAt: string;
};

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#233b66] focus:ring-2 focus:ring-[#233b66]/20";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "tenant" | "rbac" | "users"
  >("profile");
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Profile
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tenant profile editing
  const [tenantName, setTenantName] = useState("");
  const [tenantCurrency, setTenantCurrency] = useState("ETB");
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantSaved, setTenantSaved] = useState(false);

  // Forms
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    roleId: "",
  });
  const [showInvite, setShowInvite] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);

  // Inline editing roles
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleForm, setEditRoleForm] = useState({
    name: "",
    description: "",
  });
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // User status loaders
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingUserRoleId, setUpdatingUserRoleId] = useState<string | null>(
    null,
  );

  // Custom confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const raw =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("betflow-auth") ??
          window.sessionStorage.getItem("betflow-auth"))
        : null;

    let rolesList: string[] = [];
    let initialUser: {
      firstName?: string;
      lastName?: string;
      email?: string;
      avatarUrl?: string;
    } | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        initialUser = parsed.user;
        if (initialUser) {
          setProfileForm({
            firstName: initialUser.firstName || "",
            lastName: initialUser.lastName || "",
            email: initialUser.email || "",
            avatarUrl: initialUser.avatarUrl || "",
          });
        }
        const token = parsed.accessToken;
        if (token) {
          const base64Url = token.split(".")[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const rawBinary = window.atob(base64);
            const jsonPayload = decodeURIComponent(
              rawBinary
                .split("")
                .map(
                  (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
                .join(""),
            );
            rolesList = JSON.parse(jsonPayload).roles ?? [];
          }
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }

    const hasAdminAccess =
      rolesList.includes("Owner") || rolesList.includes("Admin");
    setIsAdmin(hasAdminAccess);

    try {
      if (hasAdminAccess) {
        const [tenantData, rolesData, usersData] = await Promise.all([
          apiFetch<Tenant>("/tenants"),
          apiFetch<Role[]>("/roles"),
          apiFetch<User[]>("/users"),
        ]);
        setTenant(tenantData);
        setTenantName(tenantData.name);
        setTenantCurrency(tenantData.currency || "ETB");
        setRoles(rolesData);
        setUsers(usersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const usersByRole = useMemo(() => {
    const map = new Map<string, number>();
    for (const user of users) {
      if (user.roleId) map.set(user.roleId, (map.get(user.roleId) ?? 0) + 1);
    }
    return map;
  }, [users]);

  const initials = useMemo(() => {
    const first = profileForm.firstName[0] || "";
    const last = profileForm.lastName[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [profileForm]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setError(null);
    setProfileSaved(false);
    try {
      const updatedUser = await apiFetch<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
      }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          avatarUrl: profileForm.avatarUrl.trim() || undefined,
        }),
      });

      const raw =
        window.localStorage.getItem("betflow-auth") ??
        window.sessionStorage.getItem("betflow-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user = {
          ...parsed.user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatarUrl: updatedUser.avatarUrl,
        };
        const store = window.localStorage.getItem("betflow-auth")
          ? window.localStorage
          : window.sessionStorage;
        store.setItem("betflow-auth", JSON.stringify(parsed));
        window.dispatchEvent(new Event("storage"));
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordFeedback(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "New passwords do not match",
      });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "New password must be at least 8 characters long",
      });
      return;
    }
    setSavingPassword(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFeedback({
        type: "success",
        message: "Password updated successfully!",
      });
      setTimeout(() => setPasswordFeedback(null), 3000);
    } catch (err) {
      setPasswordFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to change password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const saveTenant = async (event: FormEvent) => {
    event.preventDefault();
    if (!tenant) return;
    setSavingTenant(true);
    setError(null);
    setTenantSaved(false);
    try {
      const updated = await apiFetch<Tenant>(`/tenants/${tenant.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: tenantName.trim(),
          currency: tenantCurrency,
        }),
      });
      setTenant(updated);
      setTenantName(updated.name);
      setTenantCurrency(updated.currency);
      updateSessionCurrency(updated.currency);
      setTenantSaved(true);
      setTimeout(() => setTenantSaved(false), 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save tenant settings",
      );
    } finally {
      setSavingTenant(false);
    }
  };

  const createRole = async (event: FormEvent) => {
    event.preventDefault();
    setSavingRole(true);
    setError(null);
    try {
      await apiFetch<Role>("/roles", {
        method: "POST",
        body: JSON.stringify({
          name: roleForm.name.trim(),
          description: roleForm.description.trim() || undefined,
        }),
      });
      setRoleForm({ name: "", description: "" });
      setShowRoleForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setSavingRole(false);
    }
  };

  const inviteUser = async (event: FormEvent) => {
    event.preventDefault();
    setSavingInvite(true);
    setError(null);
    try {
      await apiFetch<User>("/users/invite", {
        method: "POST",
        body: JSON.stringify({
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          roleId: inviteForm.roleId,
        }),
      });
      setInviteForm({ name: "", email: "", roleId: "" });
      setShowInvite(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setSavingInvite(false);
    }
  };

  const handleStartEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditRoleForm({ name: role.name, description: role.description ?? "" });
  };

  const handleSaveRole = async (id: string) => {
    setSavingRoleId(id);
    setError(null);
    try {
      await apiFetch(`/roles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editRoleForm.name.trim(),
          description: editRoleForm.description.trim() || undefined,
        }),
      });
      setEditingRoleId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleDeleteRole = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Role Confirmation",
      message:
        "Are you sure you want to delete this role? This will also remove it from any users assigned to it.",
      confirmText: "Delete Role",
      onConfirm: async () => {
        setError(null);
        try {
          await apiFetch(`/roles/${id}`, { method: "DELETE" });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await load();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to delete role",
          );
        }
      },
    });
  };

  const handleUpdateUserRole = async (userId: string, roleId: string) => {
    if (!roleId) return;
    setUpdatingUserRoleId(userId);
    setError(null);
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ roleId }),
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user role",
      );
    } finally {
      setUpdatingUserRoleId(null);
    }
  };

  const [updatingUserStatusId, setUpdatingUserStatusId] = useState<string | null>(null);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    setUpdatingUserStatusId(userId);
    setError(null);
    try {
      const newIsActive = currentStatus !== "active";
      await apiFetch(`/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: newIsActive }),
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update user status",
      );
    } finally {
      setUpdatingUserStatusId(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User Confirmation",
      message:
        "Are you sure you want to delete this user? If they own accounts or leads, they will be deactivated instead.",
      confirmText: "Delete User",
      onConfirm: async () => {
        setDeletingUserId(id);
        setError(null);
        try {
          await apiFetch(`/users/${id}`, { method: "DELETE" });
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await load();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to delete user",
          );
        } finally {
          setDeletingUserId(null);
        }
      },
    });
  };

  const settingsModules = [
    {
      title: "Branding & Portal",
      desc: "Logo, colors, and white-label theme",
      icon: Palette,
      href: "/settings/branding",
      badge: "Design",
    },
    {
      title: "Custom Domains",
      desc: "Map custom portal domain names",
      icon: Globe,
      href: "/settings/domains",
      badge: "DNS",
    },
    {
      title: "Audit Logs",
      desc: "Security and system activity history",
      icon: History,
      href: "/settings/audit-logs",
      badge: "Security",
    },
    {
      title: "Data Backup & Export",
      desc: "Database backups and bulk exports",
      icon: Database,
      href: "/settings/data",
      badge: "Storage",
    },
    {
      title: "Data Import",
      desc: "Import leads, contacts, and units",
      icon: UploadCloud,
      href: "/settings/import",
      badge: "CSV / Excel",
    },
    {
      title: "Feature Flags",
      desc: "Toggle experimental features",
      icon: Flag,
      href: "/settings/feature-flags",
      badge: "System",
    },
    {
      title: "Subscription & Billing",
      desc: "Manage plan, seats, and invoices",
      icon: CreditCard,
      href: "/settings/subscription",
      badge: "Plan",
    },
  ];

  return (
    <DashboardShell
      title="System Settings"
      description="Personal account security and workspace organization controls."
      active="Settings"
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">
            Loading system settings…
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-2xs">
              {error}
            </div>
          )}

          {/* Top Segmented Navigation Tabs matching Sidebar #233b66 Theme */}
          <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                  activeTab === "profile"
                    ? "bg-[#233b66] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#233b66]",
                )}
              >
                <UserIcon className="size-3.5" />
                My Profile
              </button>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tenant")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "tenant"
                        ? "bg-[#233b66] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#233b66]",
                    )}
                  >
                    <Building2 className="size-3.5" />
                    Workspace Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("rbac")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "rbac"
                        ? "bg-[#233b66] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#233b66]",
                    )}
                  >
                    <ShieldCheck className="size-3.5" />
                    Roles & Permissions ({roles.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "users"
                        ? "bg-[#233b66] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#233b66]",
                    )}
                  >
                    <Users className="size-3.5" />
                    User Directory ({users.length})
                  </button>
                </>
              )}
            </div>

            {tenant && (
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500 font-semibold">
                <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Workspace:{" "}
                  <strong className="text-[#233b66]">{tenant.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* TAB 1: PERSONAL PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Profile Summary Card */}
              <div className="xl:col-span-1 space-y-6">
                <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs text-center">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt={profileForm.firstName}
                      className="mx-auto mb-4 size-20 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                    />
                  ) : (
                    <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#233b66] to-[#162744] text-2xl font-extrabold text-white shadow-md">
                      {initials}
                    </div>
                  )}
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {profileForm.firstName || "User"} {profileForm.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {profileForm.email || "Registered Account"}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#233b66]/10 border border-[#233b66]/20 px-3 py-1 text-xs font-bold text-[#233b66] shadow-2xs">
                      <ShieldCheck className="size-3.5 text-[#233b66]" />
                      {isAdmin ? "Workspace Administrator" : "Standard User"}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 text-left text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Type</span>
                      <span className="font-semibold text-[#233b66]">
                        Corporate CRM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Security Status</span>
                      <span className="font-semibold text-emerald-600">
                        Protected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Modules */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Workspace Modules
                  </h4>
                  <div className="space-y-2">
                    {settingsModules.slice(0, 4).map((mod) => {
                      const ModIcon = mod.icon;
                      return (
                        <Link
                          key={mod.title}
                          href={mod.href}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-md bg-[#233b66]/10 text-[#233b66]">
                              <ModIcon className="size-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              {mod.title}
                            </span>
                          </div>
                          <ArrowRight className="size-3.5 text-slate-400" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Forms Column */}
              <div className="xl:col-span-2 space-y-6">
                {/* Personal Details Form */}
                <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                    <UserIcon className="size-5 text-[#233b66]" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Personal Profile Details
                      </h2>
                      <p className="text-xs text-slate-500">
                        Update your identity and display preferences in this
                        workspace.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={saveProfile} className="grid gap-4">
                    {/* Profile Picture Uploader & Presets */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        Profile Picture / Avatar
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        {profileForm.avatarUrl ? (
                          <img
                            src={profileForm.avatarUrl}
                            alt="Avatar Preview"
                            className="size-16 rounded-xl object-cover border border-slate-300 shadow-xs"
                          />
                        ) : (
                          <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#233b66] to-[#162744] text-xl font-bold text-white shadow-xs">
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-[220px] space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="flex h-8 items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 cursor-pointer transition">
                              <UploadCloud className="size-3.5 text-[#233b66]" />
                              Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 3 * 1024 * 1024) {
                                    setError("Profile picture size should be less than 3MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === "string") {
                                      setProfileForm((prev) => ({
                                        ...prev,
                                        avatarUrl: reader.result as string,
                                      }));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            {profileForm.avatarUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setProfileForm((prev) => ({ ...prev, avatarUrl: "" }))
                                }
                                className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                              >
                                Revert to Default Avatar
                              </button>
                            ) : null}
                          </div>
                          <input
                            type="url"
                            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-[#233b66]"
                            placeholder="Or paste profile image URL..."
                            value={profileForm.avatarUrl}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, avatarUrl: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                        First name
                        <input
                          className={inputClass}
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </label>
                      <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                        Last name
                        <input
                          className={inputClass}
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      {profileSaved ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="size-4" /> Profile updated
                          successfully
                        </span>
                      ) : (
                        <div />
                      )}

                      <Button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-[#233b66] hover:bg-[#192b4b] text-white font-bold text-xs h-9 px-4"
                      >
                        {savingProfile ? "Saving Details…" : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </section>

                {/* Change Password Form */}
                <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                    <KeyRound className="size-5 text-[#233b66]" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Security & Password
                      </h2>
                      <p className="text-xs text-slate-500">
                        Ensure your account is protected with a strong security
                        key.
                      </p>
                    </div>
                  </div>

                  {passwordFeedback && (
                    <div
                      className={cn(
                        "mb-4 rounded-xl border p-3.5 text-xs font-semibold shadow-2xs",
                        passwordFeedback.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700",
                      )}
                    >
                      {passwordFeedback.message}
                    </div>
                  )}

                  <form onSubmit={savePassword} className="grid gap-4">
                    <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                      Current password
                      <input
                        className={inputClass}
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                        New password
                        <input
                          className={inputClass}
                          type="password"
                          placeholder="Min 8 characters"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </label>
                      <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                        Confirm new password
                        <input
                          className={inputClass}
                          type="password"
                          placeholder="Re-type password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-2">
                      <Button
                        type="submit"
                        disabled={savingPassword}
                        className="bg-[#233b66] hover:bg-[#192b4b] text-white font-bold text-xs h-9 px-4"
                      >
                        {savingPassword
                          ? "Updating Password…"
                          : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: WORKSPACE PROFILE TAB */}
          {activeTab === "tenant" && isAdmin && (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-3">
                {/* Tenant Config Form */}
                <div className="xl:col-span-2">
                  <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                      <Building2 className="size-5 text-[#233b66]" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Workspace Tenant Profile
                        </h2>
                        <p className="text-xs text-slate-500">
                          Operational settings and default financial currency.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={saveTenant} className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                          Workspace name
                          <input
                            className={inputClass}
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                          />
                        </label>
                        <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                          Domain Slug
                          <input
                            className={cn(
                              inputClass,
                              "bg-slate-50 text-slate-500 cursor-not-allowed",
                            )}
                            value={tenant?.slug ?? tenant?.domain ?? ""}
                            readOnly
                          />
                        </label>
                      </div>

                      <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                        Default System Currency
                        <select
                          className={inputClass}
                          value={tenantCurrency}
                          onChange={(e) => setTenantCurrency(e.target.value)}
                        >
                          {CURRENCIES.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.label} ({currency.code})
                            </option>
                          ))}
                        </select>
                        <span className="text-[11px] font-medium text-slate-400">
                          New deals, contracts, and payment records are recorded
                          in this currency.
                        </span>
                      </label>

                      <div className="grid grid-cols-2 gap-4">
                        <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                          Hosting Region
                          <input
                            className={cn(
                              inputClass,
                              "bg-slate-50 text-slate-500 cursor-not-allowed",
                            )}
                            value={tenant?.region ?? "US-East"}
                            readOnly
                          />
                        </label>
                        <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                          Subscription Plan
                          <input
                            className={cn(
                              inputClass,
                              "bg-slate-50 text-[#233b66] font-extrabold cursor-not-allowed",
                            )}
                            value={tenant?.plan ?? "ENTERPRISE"}
                            readOnly
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                        {tenantSaved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <CheckCircle2 className="size-4" /> Workspace
                            updated
                          </span>
                        ) : (
                          <div />
                        )}

                        <Button
                          type="submit"
                          disabled={
                            savingTenant ||
                            (tenantName.trim() === tenant?.name &&
                              tenantCurrency === tenant?.currency)
                          }
                          className="bg-[#233b66] hover:bg-[#192b4b] text-white font-bold text-xs h-9 px-4"
                        >
                          {savingTenant ? "Saving…" : "Save Workspace Profile"}
                        </Button>
                      </div>
                    </form>
                  </section>
                </div>

                {/* Workspace Admin Modules Grid */}
                <div className="xl:col-span-1">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Enterprise Modules
                    </h3>
                    <div className="grid gap-2.5">
                      {settingsModules.map((mod) => {
                        const ModIcon = mod.icon;
                        return (
                          <Link
                            key={mod.title}
                            href={mod.href}
                            className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-[#233b66]/30 hover:bg-slate-50 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-[#233b66]/10 text-[#233b66] group-hover:bg-[#233b66] group-hover:text-white transition">
                                <ModIcon className="size-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">
                                  {mod.title}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  {mod.desc}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {mod.badge}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROLES & PERMISSIONS TAB */}
          {activeTab === "rbac" && isAdmin && (
            <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4.5 text-[#233b66]" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Role-Based Access Control (RBAC)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define team role scopes and granular system permission
                    policies.
                  </p>
                </div>
                <Button
                  onClick={() => setShowRoleForm((v) => !v)}
                  className="bg-[#233b66] hover:bg-[#192b4b] text-white font-bold text-xs h-8.5 px-3"
                >
                  {showRoleForm ? (
                    <X className="size-3.5 mr-1" />
                  ) : (
                    <Plus className="size-3.5 mr-1" />
                  )}
                  {showRoleForm ? "Cancel" : "New Role"}
                </Button>
              </div>

              {showRoleForm && (
                <form
                  onSubmit={createRole}
                  className="grid gap-3 border-b border-slate-200 bg-[#233b66]/5 p-4 sm:grid-cols-2"
                >
                  <input
                    className={inputClass}
                    placeholder="Role name (e.g. Sales Manager)"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Description (optional)"
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                  />
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      disabled={savingRole}
                      className="bg-[#233b66] text-white font-bold text-xs"
                    >
                      {savingRole ? "Creating…" : "Create Role"}
                    </Button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Scope Description</th>
                      <th className="px-5 py-3 text-center">Assigned Users</th>
                      <th className="px-5 py-3">Permission Keys</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roles.map((role) => (
                      <tr
                        key={role.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {editingRoleId === role.id ? (
                            <input
                              className="h-8 rounded-lg border border-slate-300 px-2 text-xs font-semibold outline-none focus:border-[#233b66]"
                              value={editRoleForm.name}
                              onChange={(e) =>
                                setEditRoleForm({
                                  ...editRoleForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#233b66]/10 border border-[#233b66]/20 px-2.5 py-1 font-bold text-[#233b66]">
                              {role.name}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {editingRoleId === role.id ? (
                            <input
                              className="h-8 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-[#233b66]"
                              value={editRoleForm.description}
                              onChange={(e) =>
                                setEditRoleForm({
                                  ...editRoleForm,
                                  description: e.target.value,
                                })
                              }
                            />
                          ) : (
                            (role.description ?? "—")
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800">
                            {usersByRole.get(role.id) ?? 0} members
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                          {role.permissionKeys.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {role.permissionKeys.slice(0, 3).map((pk) => (
                                <span
                                  key={pk}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600"
                                >
                                  {pk}
                                </span>
                              ))}
                              {role.permissionKeys.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  +{role.permissionKeys.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">
                              full_access
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {editingRoleId === role.id ? (
                              <>
                                <Button
                                  size="icon-sm"
                                  onClick={() => handleSaveRole(role.id)}
                                  disabled={savingRoleId === role.id}
                                  className="bg-emerald-600 text-white"
                                >
                                  {savingRoleId === role.id ? (
                                    <RotateCw className="size-3.5 animate-spin" />
                                  ) : (
                                    <Save className="size-3.5" />
                                  )}
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="outline"
                                  onClick={() => setEditingRoleId(null)}
                                >
                                  <X className="size-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleStartEditRole(role)}
                                  className="text-slate-600 hover:text-slate-900"
                                >
                                  <Edit2 className="size-3.5" />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: USER DIRECTORY MANAGEMENT TAB */}
          {activeTab === "users" && isAdmin && (
            <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4.5 text-[#233b66]" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Workspace User Directory
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Invite team members, assign workspace roles, and manage
                    access status.
                  </p>
                </div>
                <Button
                  onClick={() => setShowInvite((v) => !v)}
                  disabled={!showInvite && roles.length === 0}
                  className="bg-[#233b66] hover:bg-[#192b4b] text-white font-bold text-xs h-8.5 px-3"
                >
                  {showInvite ? (
                    <X className="size-3.5 mr-1" />
                  ) : (
                    <Plus className="size-3.5 mr-1" />
                  )}
                  {showInvite ? "Cancel" : "Invite User"}
                </Button>
              </div>

              {showInvite && (
                <form
                  onSubmit={inviteUser}
                  className="grid gap-3 border-b border-slate-200 bg-[#233b66]/5 p-4 sm:grid-cols-3"
                >
                  <input
                    className={inputClass}
                    placeholder="Full Name"
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Email Address"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    required
                  />
                  <select
                    className={inputClass}
                    aria-label="Assign role"
                    value={inviteForm.roleId}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, roleId: e.target.value })
                    }
                    required
                  >
                    <option value="">Assign role…</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="sm:col-span-3 flex items-center justify-between">
                    <Button
                      type="submit"
                      disabled={savingInvite}
                      className="bg-[#233b66] text-white font-bold text-xs"
                    >
                      {savingInvite ? "Sending Invite…" : "Send Invite"}
                    </Button>
                    <span className="text-xs text-slate-500 font-medium">
                      Invited users receive an email link with a temporary
                      sign-in token.
                    </span>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">Assigned Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Joined Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const userInitials = user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7 items-center justify-center rounded-full bg-[#233b66] text-[11px] font-extrabold text-white">
                                {userInitials}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">
                            {user.email}
                          </td>
                          <td className="px-5 py-3.5">
                            <select
                              className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-semibold bg-white outline-none focus:border-[#233b66] disabled:opacity-50"
                              value={user.roleId ?? ""}
                              onChange={(e) =>
                                handleUpdateUserRole(user.id, e.target.value)
                              }
                              disabled={updatingUserRoleId === user.id}
                            >
                              <option value="">No Role</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            {updatingUserRoleId === user.id && (
                              <RotateCw className="size-3.5 animate-spin inline ml-2 text-slate-500" />
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {user.status === "active" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleUserStatus(user.id, user.status)
                                }
                                disabled={updatingUserStatusId === user.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
                                title="Click to deactivate user account"
                              >
                                {updatingUserStatusId === user.id ? (
                                  <RotateCw className="size-3 animate-spin text-emerald-600" />
                                ) : (
                                  <CheckCircle2 className="size-3 text-emerald-600" />
                                )}
                                <span>ACTIVE</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleUserStatus(user.id, user.status)
                                }
                                disabled={updatingUserStatusId === user.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-300 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shadow-2xs group"
                                title="Click to approve & activate this user account"
                              >
                                {updatingUserStatusId === user.id ? (
                                  <RotateCw className="size-3 animate-spin text-amber-600" />
                                ) : (
                                  <ShieldAlert className="size-3 text-amber-600 group-hover:text-white" />
                                )}
                                <span>INACTIVE (Click to Activate)</span>
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.status !== "active" && (
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    handleToggleUserStatus(user.id, user.status)
                                  }
                                  disabled={updatingUserStatusId === user.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-2.5 gap-1 shadow-2xs cursor-pointer"
                                  title="Approve and activate this user"
                                >
                                  {updatingUserStatusId === user.id ? (
                                    <RotateCw className="size-3 animate-spin" />
                                  ) : (
                                    <UserCheck className="size-3.5" />
                                  )}
                                  Approve
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUserId === user.id}
                                title="Delete or deactivate user"
                              >
                                {deletingUserId === user.id ? (
                                  <RotateCw className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant="danger"
        loading={Boolean(deletingUserId)}
      />
    </DashboardShell>
  );
}
