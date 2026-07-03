import { scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public';
}

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});
const tenantId = 'tenant_001';

async function hashPassword(password: string) {
  const salt = 'betflow-demo-salt';
  const key = (await scryptAsync(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${key.toString('hex')}`;
}

async function upsertUser(input: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      tenantId,
      password: await hashPassword('admin123'),
      firstName: input.firstName,
      lastName: input.lastName,
      isActive: true,
    },
    create: {
      id: input.id,
      tenantId,
      email: input.email,
      password: await hashPassword('admin123'),
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
    update: { tenantId },
    create: {
      tenantId,
      userId: user.id,
      roleId: input.roleId,
    },
  });

  return user;
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'betflow-crm' },
    update: {
      name: 'BetFlow Demo Realty',
    },
    create: {
      id: tenantId,
      name: 'BetFlow Demo Realty',
      domain: 'betflow-crm',
    },
  });

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
      update: { tenantId, name, description },
      create: { id, tenantId, name, description },
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
      where: {
        tenantId_name: {
          tenantId,
          name,
        },
      },
      update: { module, description },
      create: { id, tenantId, name, module, description },
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
        update: { tenantId },
        create: { tenantId, roleId, permissionId },
      });
    }
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

  await prisma.subscription.upsert({
    where: { id: 'sub_growth_001' },
    update: {
      tenantId,
      planName: 'Growth',
      startDate: new Date('2026-06-26T00:00:00.000Z'),
      status: 'TRIAL',
    },
    create: {
      id: 'sub_growth_001',
      tenantId,
      planName: 'Growth',
      startDate: new Date('2026-06-26T00:00:00.000Z'),
      status: 'TRIAL',
    },
  });

  const sources = [
    ['source_website', 'Website'],
    ['source_meta', 'Facebook/Instagram'],
    ['source_referral', 'Referral'],
  ];
  for (const [id, name] of sources) {
    await prisma.leadSource.upsert({
      where: { id },
      update: { tenantId, name },
      create: { id, tenantId, name },
    });
  }

  const stages: [string, string, number, number][] = [
    ['stage_new', 'New inquiry', 1, 10],
    ['stage_qualified', 'Qualified', 2, 35],
    ['stage_reserved', 'Reserved', 3, 70],
    ['stage_contract', 'Contracting', 4, 90],
  ];
  for (const [id, name, order, probability] of stages) {
    await prisma.dealStage.upsert({
      where: { id },
      update: { tenantId, name, order, probability },
      create: { id, tenantId, name, order, probability },
    });
  }

  const project = await prisma.project.upsert({
    where: { id: 'project_001' },
    update: {
      tenantId,
      name: 'Harbor Heights',
      description:
        'Waterfront residential project with premium mixed-use inventory.',
      status: 'ACTIVE',
    },
    create: {
      id: 'project_001',
      tenantId,
      name: 'Harbor Heights',
      description:
        'Waterfront residential project with premium mixed-use inventory.',
      status: 'ACTIVE',
    },
  });

  const building = await prisma.building.upsert({
    where: { id: 'building_001' },
    update: {
      tenantId,
      projectId: project.id,
      name: 'Tower A',
      floorsCount: 18,
    },
    create: {
      id: 'building_001',
      tenantId,
      projectId: project.id,
      name: 'Tower A',
      floorsCount: 18,
    },
  });

  const floor = await prisma.floor.upsert({
    where: { id: 'floor_001' },
    update: {
      tenantId,
      buildingId: building.id,
      floorNumber: 8,
      name: 'Level 8',
    },
    create: {
      id: 'floor_001',
      tenantId,
      buildingId: building.id,
      floorNumber: 8,
      name: 'Level 8',
    },
  });

  const units: [string, string, string, string, string, number][] = [
    ['unit_801', '801', 'APARTMENT', 'AVAILABLE', '420000.00', 122],
    ['unit_802', '802', 'APARTMENT', 'RESERVED', '465000.00', 136],
    ['unit_803', '803', 'APARTMENT', 'SOLD', '510000.00', 148],
  ];
  for (const [id, unitNumber, type, status, price, area] of units) {
    await prisma.unit.upsert({
      where: { id },
      update: {
        tenantId,
        floorId: floor.id,
        unitNumber,
        type,
        status,
        price,
        area,
      },
      create: {
        id,
        tenantId,
        floorId: floor.id,
        unitNumber,
        type,
        status,
        price,
        area,
      },
    });
  }

  const customer = await prisma.customer.upsert({
    where: { id: 'customer_001' },
    update: {
      tenantId,
      firstName: 'Nadia',
      lastName: 'Rahman',
      email: 'nadia.rahman@example.com',
      phone: '+1 555 0101',
    },
    create: {
      id: 'customer_001',
      tenantId,
      firstName: 'Nadia',
      lastName: 'Rahman',
      email: 'nadia.rahman@example.com',
      phone: '+1 555 0101',
    },
  });

  const secondCustomer = await prisma.customer.upsert({
    where: { id: 'customer_002' },
    update: {
      tenantId,
      firstName: 'Victor',
      lastName: 'Chen',
      email: 'victor.chen@example.com',
      phone: '+1 555 0102',
    },
    create: {
      id: 'customer_002',
      tenantId,
      firstName: 'Victor',
      lastName: 'Chen',
      email: 'victor.chen@example.com',
      phone: '+1 555 0102',
    },
  });

  const leads: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ][] = [
    [
      'lead_001',
      'Amira',
      'Saleh',
      'Harbor Realty Group',
      'amira.saleh@example.com',
      '+1 555 0201',
      'NEW',
      'source_website',
      owner.id,
    ],
    [
      'lead_002',
      'Diego',
      'Martinez',
      'Skyline Ventures',
      'diego.martinez@example.com',
      '+1 555 0202',
      'QUALIFIED',
      'source_meta',
      agent.id,
    ],
    [
      'lead_003',
      'Priya',
      'Kapoor',
      'Meridian Holdings',
      'priya.kapoor@example.com',
      '+1 555 0203',
      'FOLLOW_UP',
      'source_referral',
      agent.id,
    ],
  ];
  for (const [
    id,
    firstName,
    lastName,
    company,
    email,
    phone,
    status,
    sourceId,
    ownerId,
  ] of leads) {
    await prisma.lead.upsert({
      where: { id },
      update: {
        tenantId,
        firstName,
        lastName,
        company,
        email,
        phone,
        status,
        sourceId,
        ownerId,
      },
      create: {
        id,
        tenantId,
        firstName,
        lastName,
        company,
        email,
        phone,
        status,
        sourceId,
        ownerId,
      },
    });
  }

  const deal = await prisma.deal.upsert({
    where: { id: 'deal_001' },
    update: {
      tenantId,
      name: 'Nadia Rahman - Unit 802',
      value: '465000.00',
      stageId: 'stage_reserved',
      customerId: customer.id,
      unitId: 'unit_802',
    },
    create: {
      id: 'deal_001',
      tenantId,
      name: 'Nadia Rahman - Unit 802',
      value: '465000.00',
      stageId: 'stage_reserved',
      customerId: customer.id,
      unitId: 'unit_802',
    },
  });

  await prisma.deal.upsert({
    where: { id: 'deal_002' },
    update: {
      tenantId,
      name: 'Victor Chen - Unit 801',
      value: '420000.00',
      stageId: 'stage_qualified',
      customerId: secondCustomer.id,
      unitId: 'unit_801',
    },
    create: {
      id: 'deal_002',
      tenantId,
      name: 'Victor Chen - Unit 801',
      value: '420000.00',
      stageId: 'stage_qualified',
      customerId: secondCustomer.id,
      unitId: 'unit_801',
    },
  });

  await prisma.siteVisit.upsert({
    where: { id: 'visit_001' },
    update: {
      tenantId,
      customerId: customer.id,
      date: new Date('2026-07-02T15:00:00.000Z'),
      status: 'SCHEDULED',
      notes: 'Tour Tower A amenities and Unit 802.',
    },
    create: {
      id: 'visit_001',
      tenantId,
      customerId: customer.id,
      date: new Date('2026-07-02T15:00:00.000Z'),
      status: 'SCHEDULED',
      notes: 'Tour Tower A amenities and Unit 802.',
    },
  });

  const reservation = await prisma.reservation.upsert({
    where: { id: 'reservation_001' },
    update: {
      tenantId,
      customerId: customer.id,
      unitId: 'unit_802',
      amount: '25000.00',
      status: 'APPROVED',
      date: new Date('2026-06-30T10:00:00.000Z'),
    },
    create: {
      id: 'reservation_001',
      tenantId,
      customerId: customer.id,
      unitId: 'unit_802',
      amount: '25000.00',
      status: 'APPROVED',
      date: new Date('2026-06-30T10:00:00.000Z'),
    },
  });

  const contract = await prisma.contract.upsert({
    where: { id: 'contract_001' },
    update: {
      tenantId,
      customerId: customer.id,
      unitId: 'unit_802',
      dealId: deal.id,
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      totalAmt: '465000.00',
      status: 'PENDING_SIGNATURE',
    },
    create: {
      id: 'contract_001',
      tenantId,
      customerId: customer.id,
      unitId: 'unit_802',
      dealId: deal.id,
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      totalAmt: '465000.00',
      status: 'PENDING_SIGNATURE',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment_001' },
    update: {
      tenantId,
      reservationId: reservation.id,
      amount: '25000.00',
      method: 'TRANSFER',
      status: 'COMPLETED',
      date: new Date('2026-06-30T11:15:00.000Z'),
    },
    create: {
      id: 'payment_001',
      tenantId,
      reservationId: reservation.id,
      amount: '25000.00',
      method: 'TRANSFER',
      status: 'COMPLETED',
      date: new Date('2026-06-30T11:15:00.000Z'),
    },
  });

  const schedules = [
    ['schedule_001', '2026-07-15T00:00:00.000Z', '90000.00', 'PENDING'],
    ['schedule_002', '2026-08-15T00:00:00.000Z', '175000.00', 'PENDING'],
    ['schedule_003', '2026-09-15T00:00:00.000Z', '175000.00', 'PENDING'],
  ];
  for (const [id, dueDate, amount, status] of schedules) {
    await prisma.paymentSchedule.upsert({
      where: { id },
      update: {
        tenantId,
        contractId: contract.id,
        dueDate: new Date(dueDate),
        amount,
        status,
      },
      create: {
        id,
        tenantId,
        contractId: contract.id,
        dueDate: new Date(dueDate),
        amount,
        status,
      },
    });
  }

  await prisma.document.upsert({
    where: { id: 'document_001' },
    update: {
      tenantId,
      name: 'Reservation receipt - Unit 802',
      fileUrl: '/demo/documents/reservation-receipt-802.pdf',
      entityType: 'Reservation',
      entityId: reservation.id,
    },
    create: {
      id: 'document_001',
      tenantId,
      name: 'Reservation receipt - Unit 802',
      fileUrl: '/demo/documents/reservation-receipt-802.pdf',
      entityType: 'Reservation',
      entityId: reservation.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task_001' },
    update: {
      tenantId,
      title: 'Send signed contract reminder',
      description: 'Follow up with Nadia for contract signature.',
      dueDate: new Date('2026-07-03T17:00:00.000Z'),
      status: 'TODO',
      assigneeId: agent.id,
      entityType: 'Contract',
      entityId: contract.id,
    },
    create: {
      id: 'task_001',
      tenantId,
      title: 'Send signed contract reminder',
      description: 'Follow up with Nadia for contract signature.',
      dueDate: new Date('2026-07-03T17:00:00.000Z'),
      status: 'TODO',
      assigneeId: agent.id,
      entityType: 'Contract',
      entityId: contract.id,
    },
  });

  await prisma.note.upsert({
    where: { id: 'note_001' },
    update: {
      tenantId,
      content: 'Customer requested payment plan confirmation before signing.',
      authorId: agent.id,
      entityType: 'Deal',
      entityId: deal.id,
    },
    create: {
      id: 'note_001',
      tenantId,
      content: 'Customer requested payment plan confirmation before signing.',
      authorId: agent.id,
      entityType: 'Deal',
      entityId: deal.id,
    },
  });

  await prisma.activity.upsert({
    where: { id: 'activity_001' },
    update: {
      tenantId,
      type: 'reservation.approved',
      description: 'Reservation approved for Unit 802.',
      userId: finance.id,
      entityType: 'Reservation',
      entityId: reservation.id,
    },
    create: {
      id: 'activity_001',
      tenantId,
      type: 'reservation.approved',
      description: 'Reservation approved for Unit 802.',
      userId: finance.id,
      entityType: 'Reservation',
      entityId: reservation.id,
    },
  });

  await prisma.campaign.upsert({
    where: { id: 'campaign_001' },
    update: {
      tenantId,
      name: 'Harbor Heights July launch',
      type: 'EMAIL',
      status: 'ACTIVE',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      budget: '12000.00',
      cost: '3840.00',
    },
    create: {
      id: 'campaign_001',
      tenantId,
      name: 'Harbor Heights July launch',
      type: 'EMAIL',
      status: 'ACTIVE',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      budget: '12000.00',
      cost: '3840.00',
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notification_001' },
    update: {
      tenantId,
      userId: owner.id,
      title: 'Demo tenant ready',
      message:
        'Seeded sample CRM, inventory, sales, payments, documents, and audit data.',
      isRead: false,
    },
    create: {
      id: 'notification_001',
      tenantId,
      userId: owner.id,
      title: 'Demo tenant ready',
      message:
        'Seeded sample CRM, inventory, sales, payments, documents, and audit data.',
      isRead: false,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'audit_001' },
    update: {
      tenantId,
      userId: owner.id,
      action: 'demo.seeded',
      entityType: 'Tenant',
      entityId: tenant.id,
      newValues: {
        tenant: tenant.name,
        includes: [
          'users',
          'roles',
          'leads',
          'inventory',
          'deals',
          'payments',
          'contracts',
        ],
      },
    },
    create: {
      id: 'audit_001',
      tenantId,
      userId: owner.id,
      action: 'demo.seeded',
      entityType: 'Tenant',
      entityId: tenant.id,
      newValues: {
        tenant: tenant.name,
        includes: [
          'users',
          'roles',
          'leads',
          'inventory',
          'deals',
          'payments',
          'contracts',
        ],
      },
    },
  });

  await prisma.$disconnect();
  console.log(`Seeded demo tenant ${tenant.name}`);
  console.log('Login: admin@betflow.example / admin123 / tenant betflow-crm');
}

main().catch(async (error: Error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
