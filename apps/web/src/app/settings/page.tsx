"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Plus, ShieldAlert, X } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
  domain: string | null;
  region: string;
  plan: string;
  status: string;
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
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tenant profile editing
  const [tenantName, setTenantName] = useState("");
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantSaved, setTenantSaved] = useState(false);

  // Forms
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", roleId: "" });
  const [showInvite, setShowInvite] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const [tenantData, rolesData, usersData] = await Promise.all([
        apiFetch<Tenant>("/tenants"),
        apiFetch<Role[]>("/roles"),
        apiFetch<User[]>("/users"),
      ]);
      setTenant(tenantData);
      setTenantName(tenantData.name);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load settings";
      // These endpoints require Owner/Admin; surface that specifically.
      if (/403|forbidden|denied/i.test(message)) setForbidden(true);
      else setError(message);
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

  const saveTenant = async (event: FormEvent) => {
    event.preventDefault();
    if (!tenant) return;
    setSavingTenant(true);
    setError(null);
    setTenantSaved(false);
    try {
      const updated = await apiFetch<Tenant>(`/tenants/${tenant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: tenantName.trim() }),
      });
      setTenant(updated);
      setTenantName(updated.name);
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

  return (
    <DashboardShell
      title="Tenant settings"
      description="Workspace profile, RBAC, and user administration."
      active="Tenant"
    >
      {forbidden ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Admin access required</p>
            <p className="mt-1 text-amber-700">
              Only Owner and Admin roles can view tenant settings, RBAC, and user
              administration.
            </p>
          </div>
        </div>
      ) : loading ? (
        <p className="p-6 text-sm text-zinc-500">Loading settings…</p>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

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
                  <Button type="submit" disabled={savingTenant || tenantName.trim() === tenant?.name}>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td className="px-4 py-3 font-medium">{role.name}</td>
                        <td className="px-4 py-3 text-zinc-600">
                          {role.description ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {usersByRole.get(role.id) ?? 0}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {role.permissionKeys.length > 0
                            ? role.permissionKeys.join(", ")
                            : "—"}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                      <td className="px-4 py-3 text-zinc-600">{user.roleName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium",
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600",
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </DashboardShell>
  );
}