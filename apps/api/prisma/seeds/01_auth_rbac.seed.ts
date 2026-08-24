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
      'role_sales_manager_001',
      'Sales Manager',
      'Lead oversight, inventory allocation, team task management, and sales reports.',
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
    [
      'role_marketing_001',
      'Marketing',
      'Campaigns, lead sources, and marketing analytics.',
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
    [
      'perm_reservations_manage',
      'reservations.manage',
      'Reservations',
      'Manage unit reservations and holds.',
    ],
    [
      'perm_contracts_manage',
      'contracts.manage',
      'Contracts',
      'Manage legal sales contracts and approvals.',
    ],
    [
      'perm_site_visits_manage',
      'site-visits.manage',
      'SiteVisits',
      'Schedule and log site visits and tours.',
    ],
    [
      'perm_tasks_manage',
      'tasks.manage',
      'Tasks',
      'Create and assign tasks and action items.',
    ],
    [
      'perm_meetings_manage',
      'meetings.manage',
      'Meetings',
      'Schedule and record client meetings.',
    ],
    [
      'perm_documents_manage',
      'documents.manage',
      'Documents',
      'Upload and verify buyer KYC documents.',
    ],
    [
      'perm_campaigns_manage',
      'campaigns.manage',
      'Marketing',
      'Manage marketing campaigns and drip sequences.',
    ],
  ];

  for (const [id, name, module, description] of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: { module, description },
      create: { id, name, module, description },
    });
  }

  const rolePermissionsMap: Record<string, string[]> = {
    role_owner_001: [
      'perm_users_manage',
      'perm_roles_manage',
      'perm_leads_manage',
      'perm_inventory_manage',
      'perm_payments_approve',
      'perm_reports_view',
      'perm_reservations_manage',
      'perm_contracts_manage',
      'perm_site_visits_manage',
      'perm_tasks_manage',
      'perm_meetings_manage',
      'perm_documents_manage',
      'perm_campaigns_manage',
    ],
    role_admin_001: [
      'perm_users_manage',
      'perm_roles_manage',
      'perm_reports_view',
      'perm_documents_manage',
    ],
    role_sales_manager_001: [
      'perm_leads_manage',
      'perm_inventory_manage',
      'perm_reports_view',
      'perm_site_visits_manage',
      'perm_tasks_manage',
      'perm_meetings_manage',
    ],
    role_agent_001: [
      'perm_leads_manage',
      'perm_site_visits_manage',
      'perm_tasks_manage',
      'perm_meetings_manage',
    ],
    role_finance_001: [
      'perm_payments_approve',
      'perm_contracts_manage',
      'perm_reservations_manage',
      'perm_reports_view',
    ],
    role_marketing_001: [
      'perm_campaigns_manage',
      'perm_leads_manage',
      'perm_reports_view',
    ],
  };

  await prisma.rolePermission.deleteMany({});

  for (const [roleId, permIds] of Object.entries(rolePermissionsMap)) {
    for (const permissionId of permIds) {
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

  const admin = await upsertUser({
    id: 'user_admin_001',
    email: 'sysadmin@betflow.example',
    firstName: 'Alex',
    lastName: 'Vance',
    roleId: 'role_admin_001',
  });

  const salesManager = await upsertUser({
    id: 'user_sales_mgr_001',
    email: 'salesmgr@betflow.example',
    firstName: 'Marcus',
    lastName: 'Brody',
    roleId: 'role_sales_manager_001',
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

  const marketing = await upsertUser({
    id: 'user_marketing_001',
    email: 'marketing@betflow.example',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    roleId: 'role_marketing_001',
  });

  return { owner, admin, salesManager, agent, finance, marketing };
}
