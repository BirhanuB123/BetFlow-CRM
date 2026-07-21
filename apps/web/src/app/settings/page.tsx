"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Edit2, Plus, RotateCw, Save, ShieldAlert, Trash2, X, User as UserIcon, Settings2 } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
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
  "h-10 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "tenant">("profile");
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Profile
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
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
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", roleId: "" });
  const [showInvite, setShowInvite] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);

  // Inline editing roles
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleForm, setEditRoleForm] = useState({ name: "", description: "" });
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // User status loaders
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingUserRoleId, setUpdatingUserRoleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Retrieve active user details and roles from local storage
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("betflow-auth") ??
          window.sessionStorage.getItem("betflow-auth")
        : null;

    let rolesList: string[] = [];
    let initialUser: { firstName?: string; lastName?: string } | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        initialUser = parsed.user;
        if (initialUser) {
          setProfileForm({
            firstName: initialUser.firstName || "",
            lastName: initialUser.lastName || "",
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
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            rolesList = JSON.parse(jsonPayload).roles ?? [];
          }
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }

    const hasAdminAccess = rolesList.includes("Owner") || rolesList.includes("Admin");
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
      }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
        }),
      });

      // Update stored session data
      const raw =
        window.localStorage.getItem("betflow-auth") ??
        window.sessionStorage.getItem("betflow-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user = {
          ...parsed.user,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
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
      setPasswordFeedback({ type: "error", message: "New passwords do not match" });
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
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedback({ type: "success", message: "Password updated successfully!" });
      setTimeout(() => setPasswordFeedback(null), 3000);
    } catch (err) {
      setPasswordFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to change password",
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
        body: JSON.stringify({ name: tenantName.trim(), currency: tenantCurrency }),
      });
      setTenant(updated);
      setTenantName(updated.name);
      setTenantCurrency(updated.currency);
      updateSessionCurrency(updated.currency);
      setTenantSaved(true);
      setTimeout(() => setTenantSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tenant");
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

  const handleDeleteRole = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This will also remove it from any users assigned to it."
      )
    )
      return;
    setError(null);
    try {
      await apiFetch(`/roles/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
    }
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
      setError(err instanceof Error ? err.message : "Failed to update user role");
    } finally {
      setUpdatingUserRoleId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? If they own accounts or leads, they will be deactivated instead."
      )
    )
      return;
    setDeletingUserId(id);
    setError(null);
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <DashboardShell
      title="Settings"
      description="Personal account profiles and workspace-wide controls."
      active="Settings"
    >
      {loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading settings…</p>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Tab Navigation (Only show if user has Admin rights) */}
          {isAdmin && (
            <div className="mb-6 flex border-b border-zinc-200 text-sm font-medium">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-2.5 transition",
                  activeTab === "profile"
                    ? "border-[#0E6E63] text-[#0E6E63]"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                )}
                onClick={() => setActiveTab("profile")}
              >
                <UserIcon className="size-4" />
                My Profile
              </button>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-2.5 transition",
                  activeTab === "tenant"
                    ? "border-[#0E6E63] text-[#0E6E63]"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                )}
                onClick={() => setActiveTab("tenant")}
              >
                <Settings2 className="size-4" />
                Workspace Settings
              </button>
            </div>
          )}

          {/* TAB 1: PERSONAL PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              {/* Profile Details Form */}
              <section className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="text-base font-semibold">Personal details</h2>
                <p className="text-sm text-zinc-500 mb-5">
                  Update your identity details within this workspace.
                </p>
                <form onSubmit={saveProfile} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      First name
                      <input
                        className={inputClass}
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, firstName: e.target.value })
                        }
                        required
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Last name
                      <input
                        className={inputClass}
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, lastName: e.target.value })
                        }
                        required
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save details"}
                    </Button>
                    {profileSaved && (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                        <Check className="size-4" /> Profile updated
                      </span>
                    )}
                  </div>
                </form>
              </section>

              {/* Change Password Form */}
              <section className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="text-base font-semibold">Change password</h2>
                <p className="text-sm text-zinc-500 mb-5">
                  Ensure your account is using a secure password.
                </p>
                {passwordFeedback && (
                  <p
                    className={cn(
                      "mb-4 rounded-md border px-4 py-2 text-sm",
                      passwordFeedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {passwordFeedback.message}
                  </p>
                )}
                <form onSubmit={savePassword} className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium">
                    Current password
                    <input
                      className={inputClass}
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    New password
                    <input
                      className={inputClass}
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Confirm new password
                    <input
                      className={inputClass}
                      type="password"
                      placeholder="Re-type new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </label>
                  <div>
                    <Button type="submit" disabled={savingPassword}>
                      {savingPassword ? "Updating…" : "Change password"}
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* TAB 2: TENANT & RBAC SETTINGS TAB */}
          {activeTab === "tenant" && isAdmin && (
            <>
              <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                {/* Tenant profile */}
                <section className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold">Tenant profile</h2>
                      <p className="text-sm text-zinc-500">
                        Operational defaults for this workspace.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={saveTenant} className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-medium">
                      Tenant name
                      <input
                        className={inputClass}
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        required
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-zinc-500">
                      Workspace slug
                      <input
                        className={cn(inputClass, "bg-zinc-50 text-zinc-500")}
                        value={tenant?.slug ?? tenant?.domain ?? ""}
                        readOnly
                        title="Slug is used for sign-in and cannot be changed here"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Default currency
                      <select
                        className={inputClass}
                        value={tenantCurrency}
                        onChange={(e) => setTenantCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-normal text-zinc-500">
                        New monetary values are recorded in this workspace currency. Changing it does not convert existing amounts.
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="grid gap-2 text-sm font-medium text-zinc-500">
                        Region
                        <input
                          className={cn(inputClass, "bg-zinc-50 text-zinc-500")}
                          value={tenant?.region ?? ""}
                          readOnly
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-zinc-500">
                        Plan
                        <input
                          className={cn(inputClass, "bg-zinc-50 text-zinc-500")}
                          value={tenant?.plan ?? ""}
                          readOnly
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="submit"
                        disabled={
                          savingTenant ||
                          (tenantName.trim() === tenant?.name &&
                            tenantCurrency === tenant?.currency)
                        }
                      >
                        {savingTenant ? "Saving…" : "Save"}
                      </Button>
                      {tenantSaved && (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                          <Check className="size-4" /> Saved
                        </span>
                      )}
                    </div>
                  </form>
                </section>

                {/* RBAC */}
                <section className="rounded-lg border border-zinc-200 bg-white">
                  <div className="flex items-center justify-between border-b border-zinc-200 p-4">
                    <div>
                      <h2 className="text-base font-semibold">RBAC</h2>
                      <p className="text-sm text-zinc-500">
                        Role scopes and assigned permissions.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setShowRoleForm((v) => !v)}>
                      {showRoleForm ? <X className="size-4" /> : <Plus className="size-4" />}
                      {showRoleForm ? "Cancel" : "New role"}
                    </Button>
                  </div>

                  {showRoleForm && (
                    <form
                      onSubmit={createRole}
                      className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2"
                    >
                      <input
                        className={inputClass}
                        placeholder="Role name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
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
                        <Button type="submit" disabled={savingRole}>
                          {savingRole ? "Creating…" : "Create role"}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="bg-zinc-50 text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Scope</th>
                          <th className="px-4 py-3 font-medium">Users</th>
                          <th className="px-4 py-3 font-medium">Permissions</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {roles.map((role) => (
                          <tr key={role.id} className="hover:bg-zinc-50/50 transition">
                            <td className="px-4 py-3 font-medium">
                              {editingRoleId === role.id ? (
                                <input
                                  className="h-8 rounded border border-zinc-200 px-2 text-sm focus:border-zinc-400 outline-none"
                                  value={editRoleForm.name}
                                  onChange={(e) =>
                                    setEditRoleForm({ ...editRoleForm, name: e.target.value })
                                  }
                                />
                              ) : (
                                role.name
                              )}
                            </td>
                            <td className="px-4 py-3 text-zinc-600">
                              {editingRoleId === role.id ? (
                                <input
                                  className="h-8 w-full rounded border border-zinc-200 px-2 text-sm focus:border-zinc-400 outline-none"
                                  value={editRoleForm.description}
                                  onChange={(e) =>
                                    setEditRoleForm({
                                      ...editRoleForm,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                role.description ?? "—"
                              )}
                            </td>
                            <td className="px-4 py-3 text-zinc-600">
                              {usersByRole.get(role.id) ?? 0}
                            </td>
                            <td className="px-4 py-3 text-zinc-600">
                              {role.permissionKeys.length > 0
                                ? role.permissionKeys.join(", ")
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {editingRoleId === role.id ? (
                                  <>
                                    <Button
                                      size="icon-sm"
                                      onClick={() => handleSaveRole(role.id)}
                                      disabled={savingRoleId === role.id}
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
                                    >
                                      <Edit2 className="size-3.5" />
                                    </Button>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
              </div>

              {/* User management */}
              <section className="mt-6 rounded-lg border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-200 p-4">
                  <div>
                    <h2 className="text-base font-semibold">User management</h2>
                    <p className="text-sm text-zinc-500">
                      Invite users, assign roles, and monitor status.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowInvite((v) => !v)}
                    disabled={!showInvite && roles.length === 0}
                  >
                    {showInvite ? <X className="size-4" /> : <Plus className="size-4" />}
                    {showInvite ? "Cancel" : "Invite user"}
                  </Button>
                </div>

                {showInvite && (
                  <form
                    onSubmit={inviteUser}
                    className="grid gap-3 border-b border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-3"
                  >
                    <input
                      className={inputClass}
                      placeholder="Full name"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      required
                    />
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="Email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      required
                    />
                    <select
                      className={inputClass}
                      aria-label="Assign role"
                      value={inviteForm.roleId}
                      onChange={(e) => setInviteForm({ ...inviteForm, roleId: e.target.value })}
                      required
                    >
                      <option value="">Assign role…</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <div className="sm:col-span-3">
                      <Button type="submit" disabled={savingInvite}>
                        {savingInvite ? "Inviting…" : "Send invite"}
                      </Button>
                      <span className="ml-3 text-xs text-zinc-400">
                        Invited users get a temporary password to reset on first sign-in.
                      </span>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-zinc-50/50 transition">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                          <td className="px-4 py-3 text-zinc-600">
                            <select
                              className="h-8 rounded border border-zinc-200 px-2 text-sm bg-white outline-none focus:border-zinc-400 disabled:opacity-50"
                              value={user.roleId ?? ""}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
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
                              <RotateCw className="size-3.5 animate-spin inline ml-2 text-zinc-500" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "rounded-md px-2 py-1 text-xs font-medium",
                                user.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-600"
                              )}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? (
                                <RotateCw className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
}
