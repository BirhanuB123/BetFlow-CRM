import { scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import type { PrismaClient } from '@prisma/client';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = 'betflow-demo-salt';
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}

export async function seedAuthAndRbac(prisma: PrismaClient) {
  const roles = [
    ['role_owner_001', 'Owner', 'Full tenant administration access.'],
    [
      'role_admin_001',
      'Admin',
      'Tenant setup, users, roles, and SaaS controls.',
    ],
    [
      'role_agent_001',
      'Agent',
      'Lead, customer, deal, and site visit workflows.',
    ],
    [
      'role_finance_001',
      'Finance',
      'Payment schedules, receipts, approvals, and billing.',
    ],
  ];

  for (const [id, name, description] of roles) {
    await prisma.role.upsert({
      where: { id },
      update: { name, description },
      create: { id, name, description },
    });
  }

  const permissions = [
    [
      'perm_users_manage',
      'users.manage',
      'Users',
      'Invite and manage tenant users.',
    ],
    [
      'perm_roles_manage',
      'roles.manage',
      'RBAC',
      'Create roles and assign permissions.',
    ],
    [
      'perm_leads_manage',
      'leads.manage',
      'CRM',
      'Create, assign, and qualify leads.',
    ],
    [
      'perm_inventory_manage',
      'inventory.manage',
      'Inventory',
      'Manage projects, buildings, floors, and units.',
    ],
    [
      'perm_payments_approve',
      'payments.approve',
      'Finance',
      'Approve receipts and payment schedules.',
    ],
    [
      'perm_reports_view',
      'reports.view',
      'Reports',
      'View dashboards, forecasts, and exports.',
    ],
  ];

  for (const [id, name, module, description] of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: { module, description },
      create: { id, name, module, description },
    });
  }

  for (const [roleId] of roles) {
    for (const [permissionId] of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  async function upsertUser(input: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }) {
    const passwordHash = await hashPassword('admin123');
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        isActive: true,
      },
      create: {
        id: input.id,
        email: input.email,
        password: passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: input.roleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: input.roleId,
      },
    });

    return user;
  }

  const owner = await upsertUser({
    id: 'user_001',
    email: 'admin@betflow.example',
    firstName: 'Maya',
    lastName: 'Johnson',
    roleId: 'role_owner_001',
  });

  const agent = await upsertUser({
    id: 'user_agent_001',
    email: 'agent@betflow.example',
    firstName: 'Omar',
    lastName: 'Haddad',
    roleId: 'role_agent_001',
  });

  const finance = await upsertUser({
    id: 'user_finance_001',
    email: 'finance@betflow.example',
    firstName: 'Lina',
    lastName: 'Park',
    roleId: 'role_finance_001',
  });

  return { owner, agent, finance };
}
