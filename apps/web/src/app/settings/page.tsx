import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { roles, tenant, users } from "@/features/auth/phase-one-data";

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Tenant settings"
      description="Workspace profile, RBAC, and user administration."
      active="Tenant"
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section id="tenant" className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Tenant profile</h2>
              <p className="text-sm text-zinc-500">Operational defaults for this workspace.</p>
            </div>
            <Button variant="outline">Save</Button>
          </div>
          <div className="mt-5 grid gap-4">
            {[
              ["Tenant name", tenant.name],
              ["Workspace slug", tenant.slug],
              ["Region", tenant.region],
              ["Plan", tenant.plan],
            ].map(([label, value]) => (
              <label key={label} className="grid gap-2 text-sm font-medium">
                {label}
                <input className="h-10 rounded-md border border-zinc-200 px-3 text-sm outline-none" defaultValue={value} />
              </label>
            ))}
          </div>
        </section>

        <section id="rbac" className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4">
            <div>
              <h2 className="text-base font-semibold">RBAC</h2>
              <p className="text-sm text-zinc-500">Role scopes and assigned permissions.</p>
            </div>
            <Button variant="outline">New role</Button>
          </div>
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
                  <tr key={role.name}>
                    <td className="px-4 py-3 font-medium">{role.name}</td>
                    <td className="px-4 py-3 text-zinc-600">{role.scope}</td>
                    <td className="px-4 py-3 text-zinc-600">{role.users}</td>
                    <td className="px-4 py-3 text-zinc-600">{role.permissions.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section id="users" className="mt-6 rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <div>
            <h2 className="text-base font-semibold">User management</h2>
            <p className="text-sm text-zinc-500">Invite users, assign roles, and monitor status.</p>
          </div>
          <Button>Invite user</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((user) => (
                <tr key={user.email}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-600">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium">{user.status}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{user.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
