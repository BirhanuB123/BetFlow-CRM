import { Injectable, NotFoundException } from '@nestjs/common';

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  region: string;
  plan: string;
  status: 'active' | 'suspended';
  ownerUserId: string;
};

export type User = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'invited' | 'suspended';
};

export type Role = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  permissionKeys: string[];
};

export type Permission = {
  key: string;
  label: string;
  group: string;
};

export type AuditLog = {
  id: string;
  tenantId: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
};

export type LeadStage =
  'new' | 'qualified' | 'tour_scheduled' | 'proposal' | 'won' | 'lost';

export type Lead = {
  id: string;
  tenantId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  budget: number;
  stage: LeadStage;
  assignedToUserId?: string;
  priority: 'high' | 'medium' | 'low';
};

export type Customer = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'investor' | 'tenant';
  ownerUserId: string;
  status: 'active' | 'onboarding' | 'dormant';
};

export type Deal = {
  id: string;
  tenantId: string;
  leadId: string;
  customerId: string;
  propertyName: string;
  value: number;
  stage: LeadStage;
  probability: number;
  closeDate: string;
  ownerUserId: string;
};

export type Task = {
  id: string;
  tenantId: string;
  title: string;
  ownerUserId: string;
  relatedTo: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
};

export type Note = {
  id: string;
  tenantId: string;
  relatedTo: string;
  authorUserId: string;
  body: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  tenantId: string;
  actorUserId: string;
  action: string;
  target: string;
  type: 'call' | 'email' | 'assignment' | 'task' | 'note' | 'deal';
  createdAt: string;
};

export type Project = {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  status: 'planning' | 'active' | 'selling' | 'delivered';
};

export type Building = {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  address: string;
  floors: number;
  status: 'pre_launch' | 'open' | 'limited' | 'closed';
};

export type Floor = {
  id: string;
  tenantId: string;
  buildingId: string;
  label: string;
  releaseStatus: 'draft' | 'released' | 'hold';
};

export type UnitStatus = 'available' | 'reserved' | 'sold' | 'blocked';

export type Unit = {
  id: string;
  tenantId: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  type: 'studio' | '1br' | '2br' | '3br' | 'retail';
  areaSqft: number;
  price: number;
  status: UnitStatus;
  availableFrom: string;
  exposure: 'north' | 'south' | 'east' | 'west';
};

export type PropertyMedia = {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  type: 'photo' | 'floor_plan' | 'document' | 'virtual_tour';
  usage: 'public' | 'internal' | 'sales_packet';
  url: string;
  updatedAt: string;
};

type RegisterTenantInput = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  region?: string;
  plan?: string;
};

type InviteUserInput = {
  tenantId: string;
  name: string;
  email: string;
  roleId: string;
};

type UpdateTenantInput = Partial<
  Pick<Tenant, 'name' | 'region' | 'plan' | 'status'>
>;

type CreateLeadInput = Omit<Lead, 'id'>;
type CreateCustomerInput = Omit<Customer, 'id'>;
type CreateDealInput = Omit<Deal, 'id'>;
type CreateTaskInput = Omit<Task, 'id'>;
type CreateNoteInput = Omit<Note, 'id' | 'createdAt'>;
type CreateActivityInput = Omit<Activity, 'id' | 'createdAt'>;
type CreateProjectInput = Omit<Project, 'id'>;
type CreateBuildingInput = Omit<Building, 'id'>;
type CreateFloorInput = Omit<Floor, 'id'>;
type CreateUnitInput = Omit<Unit, 'id'>;
type CreatePropertyMediaInput = Omit<PropertyMedia, 'id' | 'updatedAt'>;

@Injectable()
export class InMemoryService {
  private readonly permissions: Permission[] = [
    { key: 'tenant.manage', label: 'Manage tenant settings', group: 'Tenant' },
    { key: 'users.manage', label: 'Invite and manage users', group: 'Users' },
    {
      key: 'roles.manage',
      label: 'Manage roles and permissions',
      group: 'RBAC',
    },
    { key: 'audit.read', label: 'Read audit logs', group: 'Audit' },
    {
      key: 'dashboard.read',
      label: 'View dashboard shell',
      group: 'Dashboard',
    },
  ];

  private readonly tenants: Tenant[] = [
    {
      id: 'tenant_001',
      name: 'BetFlow Realty',
      slug: 'betflow-realty',
      region: 'US East',
      plan: 'Growth',
      status: 'active',
      ownerUserId: 'user_001',
    },
  ];

  private readonly roles: Role[] = [
    {
      id: 'role_owner',
      tenantId: 'tenant_001',
      name: 'Owner',
      description: 'Full tenant administration access.',
      permissionKeys: [
        'tenant.manage',
        'users.manage',
        'roles.manage',
        'audit.read',
        'dashboard.read',
      ],
    },
    {
      id: 'role_admin',
      tenantId: 'tenant_001',
      name: 'Admin',
      description: 'Operational administration without ownership controls.',
      permissionKeys: [
        'users.manage',
        'roles.manage',
        'audit.read',
        'dashboard.read',
      ],
    },
    {
      id: 'role_agent',
      tenantId: 'tenant_001',
      name: 'Agent',
      description: 'Default sales workspace access.',
      permissionKeys: ['dashboard.read'],
    },
  ];

  private readonly users: User[] = [
    {
      id: 'user_001',
      tenantId: 'tenant_001',
      name: 'Maya Johnson',
      email: 'maya@betflow.example',
      roleId: 'role_owner',
      status: 'active',
    },
    {
      id: 'user_002',
      tenantId: 'tenant_001',
      name: 'Omar Haddad',
      email: 'omar@betflow.example',
      roleId: 'role_admin',
      status: 'active',
    },
  ];

  private readonly auditLogs: AuditLog[] = [
    {
      id: 'audit_001',
      tenantId: 'tenant_001',
      actor: 'Maya Johnson',
      action: 'Registered tenant',
      target: 'BetFlow Realty',
      severity: 'info',
      createdAt: new Date('2026-06-29T08:00:00.000Z').toISOString(),
    },
    {
      id: 'audit_002',
      tenantId: 'tenant_001',
      actor: 'System',
      action: 'Initialized default roles',
      target: 'RBAC',
      severity: 'info',
      createdAt: new Date('2026-06-29T08:01:00.000Z').toISOString(),
    },
  ];

  private readonly leads: Lead[] = [
    {
      id: 'lead_001',
      tenantId: 'tenant_001',
      name: 'Ari Kaplan',
      company: 'Kaplan Holdings',
      email: 'ari@kaplan.example',
      phone: '+1 555 0182',
      source: 'website',
      budget: 1800000,
      stage: 'qualified',
      assignedToUserId: 'user_002',
      priority: 'high',
    },
    {
      id: 'lead_002',
      tenantId: 'tenant_001',
      name: 'Priya Shah',
      company: 'Northline Capital',
      email: 'priya@northline.example',
      phone: '+1 555 0144',
      source: 'referral',
      budget: 920000,
      stage: 'tour_scheduled',
      assignedToUserId: 'user_002',
      priority: 'medium',
    },
  ];

  private readonly customers: Customer[] = [
    {
      id: 'customer_001',
      tenantId: 'tenant_001',
      name: 'Kaplan Holdings',
      email: 'ari@kaplan.example',
      phone: '+1 555 0182',
      type: 'investor',
      ownerUserId: 'user_002',
      status: 'onboarding',
    },
    {
      id: 'customer_002',
      tenantId: 'tenant_001',
      name: 'Bell Family Office',
      email: 'marcus@bell.example',
      phone: '+1 555 0118',
      type: 'buyer',
      ownerUserId: 'user_001',
      status: 'active',
    },
  ];

  private readonly deals: Deal[] = [
    {
      id: 'deal_001',
      tenantId: 'tenant_001',
      leadId: 'lead_001',
      customerId: 'customer_001',
      propertyName: 'Harbor Point Tower',
      value: 1800000,
      stage: 'qualified',
      probability: 45,
      closeDate: '2026-07-18',
      ownerUserId: 'user_002',
    },
    {
      id: 'deal_002',
      tenantId: 'tenant_001',
      leadId: 'lead_002',
      customerId: 'customer_002',
      propertyName: 'Meridian Residences',
      value: 2400000,
      stage: 'proposal',
      probability: 70,
      closeDate: '2026-08-02',
      ownerUserId: 'user_001',
    },
  ];

  private readonly tasks: Task[] = [
    {
      id: 'task_001',
      tenantId: 'tenant_001',
      title: 'Send updated unit availability',
      ownerUserId: 'user_002',
      relatedTo: 'customer_001',
      dueDate: '2026-07-01',
      status: 'open',
      priority: 'high',
    },
  ];

  private readonly notes: Note[] = [
    {
      id: 'note_001',
      tenantId: 'tenant_001',
      relatedTo: 'customer_001',
      authorUserId: 'user_002',
      body: 'Buyer wants two comparable investment options before the next call.',
      createdAt: new Date('2026-06-30T10:22:00.000Z').toISOString(),
    },
  ];

  private readonly activities: Activity[] = [
    {
      id: 'activity_001',
      tenantId: 'tenant_001',
      actorUserId: 'user_002',
      action: 'Assigned lead',
      target: 'lead_001',
      type: 'assignment',
      createdAt: new Date('2026-06-30T10:42:00.000Z').toISOString(),
    },
  ];

  private readonly projects: Project[] = [
    {
      id: 'project_001',
      tenantId: 'tenant_001',
      name: 'Harbor Point',
      location: 'Miami, FL',
      status: 'selling',
    },
    {
      id: 'project_002',
      tenantId: 'tenant_001',
      name: 'Meridian Residences',
      location: 'Austin, TX',
      status: 'active',
    },
  ];

  private readonly buildings: Building[] = [
    {
      id: 'building_001',
      tenantId: 'tenant_001',
      projectId: 'project_001',
      name: 'Harbor Tower A',
      address: '210 Bayfront Ave',
      floors: 24,
      status: 'open',
    },
    {
      id: 'building_002',
      tenantId: 'tenant_001',
      projectId: 'project_002',
      name: 'Meridian North',
      address: '88 Trinity St',
      floors: 16,
      status: 'open',
    },
  ];

  private readonly floors: Floor[] = [
    {
      id: 'floor_001',
      tenantId: 'tenant_001',
      buildingId: 'building_001',
      label: 'Floor 18',
      releaseStatus: 'released',
    },
    {
      id: 'floor_002',
      tenantId: 'tenant_001',
      buildingId: 'building_002',
      label: 'Floor 9',
      releaseStatus: 'released',
    },
  ];

  private readonly units: Unit[] = [
    {
      id: 'unit_001',
      tenantId: 'tenant_001',
      projectId: 'project_001',
      buildingId: 'building_001',
      floorId: 'floor_001',
      unitNumber: 'A-1802',
      type: '2br',
      areaSqft: 1240,
      price: 1180000,
      status: 'available',
      availableFrom: '2026-06-30',
      exposure: 'east',
    },
    {
      id: 'unit_002',
      tenantId: 'tenant_001',
      projectId: 'project_001',
      buildingId: 'building_001',
      floorId: 'floor_001',
      unitNumber: 'A-1803',
      type: '3br',
      areaSqft: 1680,
      price: 1740000,
      status: 'reserved',
      availableFrom: '2026-07-05',
      exposure: 'south',
    },
    {
      id: 'unit_003',
      tenantId: 'tenant_001',
      projectId: 'project_002',
      buildingId: 'building_002',
      floorId: 'floor_002',
      unitNumber: 'N-0905',
      type: '2br',
      areaSqft: 1110,
      price: 940000,
      status: 'available',
      availableFrom: '2026-06-30',
      exposure: 'west',
    },
  ];

  private readonly propertyMedia: PropertyMedia[] = [
    {
      id: 'media_001',
      tenantId: 'tenant_001',
      projectId: 'project_001',
      title: 'Harbor Point exterior gallery',
      type: 'photo',
      usage: 'public',
      url: '/media/harbor-point-gallery',
      updatedAt: new Date('2026-06-30T09:30:00.000Z').toISOString(),
    },
    {
      id: 'media_002',
      tenantId: 'tenant_001',
      projectId: 'project_001',
      title: 'Tower A floor plans',
      type: 'floor_plan',
      usage: 'sales_packet',
      url: '/media/tower-a-floor-plans',
      updatedAt: new Date('2026-06-29T14:10:00.000Z').toISOString(),
    },
  ];

  registerTenant(input: RegisterTenantInput) {
    const tenantId = this.nextId('tenant');
    const ownerRoleId = this.nextId('role');
    const ownerUserId = this.nextId('user');
    const tenant: Tenant = {
      id: tenantId,
      name: input.companyName,
      slug: input.slug,
      region: input.region ?? 'US East',
      plan: input.plan ?? 'Starter',
      status: 'active',
      ownerUserId,
    };
    const ownerRole: Role = {
      id: ownerRoleId,
      tenantId,
      name: 'Owner',
      description: 'Full tenant administration access.',
      permissionKeys: this.permissions.map((permission) => permission.key),
    };
    const owner: User = {
      id: ownerUserId,
      tenantId,
      name: input.ownerName,
      email: input.ownerEmail,
      roleId: ownerRoleId,
      status: 'active',
    };

    this.tenants.push(tenant);
    this.roles.push(ownerRole);
    this.users.push(owner);
    this.recordAudit({
      tenantId,
      actor: owner.name,
      action: 'Registered tenant',
      target: tenant.name,
      severity: 'info',
    });

    return { tenant, owner, roles: [ownerRole] };
  }

  listTenants() {
    return this.tenants;
  }

  getTenant(id: string) {
    const tenant = this.tenants.find((item) => item.id === id);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} was not found`);
    }

    return tenant;
  }

  updateTenant(id: string, input: UpdateTenantInput) {
    const tenant = this.getTenant(id);
    Object.assign(tenant, input);
    this.recordAudit({
      tenantId: id,
      actor: 'System',
      action: 'Updated tenant settings',
      target: tenant.name,
      severity: 'info',
    });
    return tenant;
  }

  listUsers(tenantId?: string) {
    return tenantId
      ? this.users.filter((user) => user.tenantId === tenantId)
      : this.users;
  }

  inviteUser(input: InviteUserInput) {
    this.getTenant(input.tenantId);
    const role = this.roles.find(
      (item) => item.id === input.roleId && item.tenantId === input.tenantId,
    );

    if (!role) {
      throw new NotFoundException(`Role ${input.roleId} was not found`);
    }

    const user: User = {
      id: this.nextId('user'),
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      roleId: input.roleId,
      status: 'invited',
    };

    this.users.push(user);
    this.recordAudit({
      tenantId: input.tenantId,
      actor: 'System',
      action: 'Invited user',
      target: input.email,
      severity: 'info',
    });
    return user;
  }

  listRoles(tenantId?: string) {
    return tenantId
      ? this.roles.filter((role) => role.tenantId === tenantId)
      : this.roles;
  }

  createRole(input: Omit<Role, 'id'>) {
    this.getTenant(input.tenantId);
    const role: Role = { ...input, id: this.nextId('role') };
    this.roles.push(role);
    this.recordAudit({
      tenantId: input.tenantId,
      actor: 'System',
      action: 'Created role',
      target: role.name,
      severity: 'info',
    });
    return role;
  }

  listPermissions() {
    return this.permissions;
  }

  listAuditLogs(tenantId?: string) {
    return tenantId
      ? this.auditLogs.filter((log) => log.tenantId === tenantId)
      : this.auditLogs;
  }

  recordAudit(input: Omit<AuditLog, 'id' | 'createdAt'>) {
    const log: AuditLog = {
      ...input,
      id: this.nextId('audit'),
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  listLeads(tenantId?: string) {
    return tenantId
      ? this.leads.filter((lead) => lead.tenantId === tenantId)
      : this.leads;
  }

  createLead(input: CreateLeadInput) {
    this.getTenant(input.tenantId);
    const lead: Lead = { ...input, id: this.nextId('lead') };
    this.leads.push(lead);
    this.recordActivity({
      tenantId: input.tenantId,
      actorUserId: input.assignedToUserId ?? 'system',
      action: 'Created lead',
      target: lead.id,
      type: 'assignment',
    });
    return lead;
  }

  assignLead(id: string, assignedToUserId: string) {
    const lead = this.leads.find((item) => item.id === id);

    if (!lead) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    lead.assignedToUserId = assignedToUserId;
    this.recordActivity({
      tenantId: lead.tenantId,
      actorUserId: assignedToUserId,
      action: 'Assigned lead',
      target: lead.id,
      type: 'assignment',
    });
    return lead;
  }

  listCustomers(tenantId?: string) {
    return tenantId
      ? this.customers.filter((customer) => customer.tenantId === tenantId)
      : this.customers;
  }

  createCustomer(input: CreateCustomerInput) {
    this.getTenant(input.tenantId);
    const customer: Customer = { ...input, id: this.nextId('customer') };
    this.customers.push(customer);
    return customer;
  }

  listDeals(tenantId?: string) {
    return tenantId
      ? this.deals.filter((deal) => deal.tenantId === tenantId)
      : this.deals;
  }

  createDeal(input: CreateDealInput) {
    this.getTenant(input.tenantId);
    const deal: Deal = { ...input, id: this.nextId('deal') };
    this.deals.push(deal);
    this.recordActivity({
      tenantId: input.tenantId,
      actorUserId: input.ownerUserId,
      action: 'Created deal',
      target: deal.id,
      type: 'deal',
    });
    return deal;
  }

  moveDeal(id: string, stage: LeadStage) {
    const deal = this.deals.find((item) => item.id === id);

    if (!deal) {
      throw new NotFoundException(`Deal ${id} was not found`);
    }

    deal.stage = stage;
    this.recordActivity({
      tenantId: deal.tenantId,
      actorUserId: deal.ownerUserId,
      action: `Moved deal to ${stage}`,
      target: deal.id,
      type: 'deal',
    });
    return deal;
  }

  listTasks(tenantId?: string) {
    return tenantId
      ? this.tasks.filter((task) => task.tenantId === tenantId)
      : this.tasks;
  }

  createTask(input: CreateTaskInput) {
    this.getTenant(input.tenantId);
    const task: Task = { ...input, id: this.nextId('task') };
    this.tasks.push(task);
    this.recordActivity({
      tenantId: input.tenantId,
      actorUserId: input.ownerUserId,
      action: 'Created task',
      target: task.id,
      type: 'task',
    });
    return task;
  }

  listNotes(tenantId?: string) {
    return tenantId
      ? this.notes.filter((note) => note.tenantId === tenantId)
      : this.notes;
  }

  createNote(input: CreateNoteInput) {
    this.getTenant(input.tenantId);
    const note: Note = {
      ...input,
      id: this.nextId('note'),
      createdAt: new Date().toISOString(),
    };
    this.notes.push(note);
    this.recordActivity({
      tenantId: input.tenantId,
      actorUserId: input.authorUserId,
      action: 'Added note',
      target: input.relatedTo,
      type: 'note',
    });
    return note;
  }

  listActivities(tenantId?: string) {
    return tenantId
      ? this.activities.filter((activity) => activity.tenantId === tenantId)
      : this.activities;
  }

  recordActivity(input: CreateActivityInput) {
    const activity: Activity = {
      ...input,
      id: this.nextId('activity'),
      createdAt: new Date().toISOString(),
    };
    this.activities.unshift(activity);
    return activity;
  }

  listProjects(tenantId?: string) {
    return tenantId
      ? this.projects.filter((project) => project.tenantId === tenantId)
      : this.projects;
  }

  createProject(input: CreateProjectInput) {
    this.getTenant(input.tenantId);
    const project: Project = { ...input, id: this.nextId('project') };
    this.projects.push(project);
    return project;
  }

  listBuildings(tenantId?: string, projectId?: string) {
    return this.buildings.filter((building) => {
      return (
        (!tenantId || building.tenantId === tenantId) &&
        (!projectId || building.projectId === projectId)
      );
    });
  }

  createBuilding(input: CreateBuildingInput) {
    this.getTenant(input.tenantId);
    const building: Building = { ...input, id: this.nextId('building') };
    this.buildings.push(building);
    return building;
  }

  listFloors(tenantId?: string, buildingId?: string) {
    return this.floors.filter((floor) => {
      return (
        (!tenantId || floor.tenantId === tenantId) &&
        (!buildingId || floor.buildingId === buildingId)
      );
    });
  }

  createFloor(input: CreateFloorInput) {
    this.getTenant(input.tenantId);
    const floor: Floor = { ...input, id: this.nextId('floor') };
    this.floors.push(floor);
    return floor;
  }

  listUnits(tenantId?: string, status?: UnitStatus) {
    return this.units.filter((unit) => {
      return (
        (!tenantId || unit.tenantId === tenantId) &&
        (!status || unit.status === status)
      );
    });
  }

  createUnit(input: CreateUnitInput) {
    this.getTenant(input.tenantId);
    const unit: Unit = { ...input, id: this.nextId('unit') };
    this.units.push(unit);
    return unit;
  }

  updateUnitStatus(id: string, status: UnitStatus, availableFrom?: string) {
    const unit = this.units.find((item) => item.id === id);

    if (!unit) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    unit.status = status;
    if (availableFrom) {
      unit.availableFrom = availableFrom;
    }
    return unit;
  }

  listPropertyMedia(tenantId?: string, projectId?: string) {
    return this.propertyMedia.filter((media) => {
      return (
        (!tenantId || media.tenantId === tenantId) &&
        (!projectId || media.projectId === projectId)
      );
    });
  }

  createPropertyMedia(input: CreatePropertyMediaInput) {
    this.getTenant(input.tenantId);
    const media: PropertyMedia = {
      ...input,
      id: this.nextId('media'),
      updatedAt: new Date().toISOString(),
    };
    this.propertyMedia.push(media);
    return media;
  }

  private nextId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
