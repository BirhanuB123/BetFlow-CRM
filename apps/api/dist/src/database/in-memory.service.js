"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryService = void 0;
const common_1 = require("@nestjs/common");
let InMemoryService = class InMemoryService {
    permissions = [
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
    tenants = [
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
    roles = [
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
    users = [
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
    auditLogs = [
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
    leads = [
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
    customers = [
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
    deals = [
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
    tasks = [
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
    notes = [
        {
            id: 'note_001',
            tenantId: 'tenant_001',
            relatedTo: 'customer_001',
            authorUserId: 'user_002',
            body: 'Buyer wants two comparable investment options before the next call.',
            createdAt: new Date('2026-06-30T10:22:00.000Z').toISOString(),
        },
    ];
    activities = [
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
    projects = [
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
    buildings = [
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
    floors = [
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
    units = [
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
    propertyMedia = [
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
    registerTenant(input) {
        const tenantId = this.nextId('tenant');
        const ownerRoleId = this.nextId('role');
        const ownerUserId = this.nextId('user');
        const tenant = {
            id: tenantId,
            name: input.companyName,
            slug: input.slug,
            region: input.region ?? 'US East',
            plan: input.plan ?? 'Starter',
            status: 'active',
            ownerUserId,
        };
        const ownerRole = {
            id: ownerRoleId,
            tenantId,
            name: 'Owner',
            description: 'Full tenant administration access.',
            permissionKeys: this.permissions.map((permission) => permission.key),
        };
        const owner = {
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
    getTenant(id) {
        const tenant = this.tenants.find((item) => item.id === id);
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${id} was not found`);
        }
        return tenant;
    }
    updateTenant(id, input) {
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
    listUsers(tenantId) {
        return tenantId
            ? this.users.filter((user) => user.tenantId === tenantId)
            : this.users;
    }
    inviteUser(input) {
        this.getTenant(input.tenantId);
        const role = this.roles.find((item) => item.id === input.roleId && item.tenantId === input.tenantId);
        if (!role) {
            throw new common_1.NotFoundException(`Role ${input.roleId} was not found`);
        }
        const user = {
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
    listRoles(tenantId) {
        return tenantId
            ? this.roles.filter((role) => role.tenantId === tenantId)
            : this.roles;
    }
    createRole(input) {
        this.getTenant(input.tenantId);
        const role = { ...input, id: this.nextId('role') };
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
    listAuditLogs(tenantId) {
        return tenantId
            ? this.auditLogs.filter((log) => log.tenantId === tenantId)
            : this.auditLogs;
    }
    recordAudit(input) {
        const log = {
            ...input,
            id: this.nextId('audit'),
            createdAt: new Date().toISOString(),
        };
        this.auditLogs.unshift(log);
        return log;
    }
    listLeads(tenantId) {
        return tenantId
            ? this.leads.filter((lead) => lead.tenantId === tenantId)
            : this.leads;
    }
    createLead(input) {
        this.getTenant(input.tenantId);
        const lead = { ...input, id: this.nextId('lead') };
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
    assignLead(id, assignedToUserId) {
        const lead = this.leads.find((item) => item.id === id);
        if (!lead) {
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
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
    listCustomers(tenantId) {
        return tenantId
            ? this.customers.filter((customer) => customer.tenantId === tenantId)
            : this.customers;
    }
    createCustomer(input) {
        this.getTenant(input.tenantId);
        const customer = { ...input, id: this.nextId('customer') };
        this.customers.push(customer);
        return customer;
    }
    listDeals(tenantId) {
        return tenantId
            ? this.deals.filter((deal) => deal.tenantId === tenantId)
            : this.deals;
    }
    createDeal(input) {
        this.getTenant(input.tenantId);
        const deal = { ...input, id: this.nextId('deal') };
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
    moveDeal(id, stage) {
        const deal = this.deals.find((item) => item.id === id);
        if (!deal) {
            throw new common_1.NotFoundException(`Deal ${id} was not found`);
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
    listTasks(tenantId) {
        return tenantId
            ? this.tasks.filter((task) => task.tenantId === tenantId)
            : this.tasks;
    }
    createTask(input) {
        this.getTenant(input.tenantId);
        const task = { ...input, id: this.nextId('task') };
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
    listNotes(tenantId) {
        return tenantId
            ? this.notes.filter((note) => note.tenantId === tenantId)
            : this.notes;
    }
    createNote(input) {
        this.getTenant(input.tenantId);
        const note = {
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
    listActivities(tenantId) {
        return tenantId
            ? this.activities.filter((activity) => activity.tenantId === tenantId)
            : this.activities;
    }
    recordActivity(input) {
        const activity = {
            ...input,
            id: this.nextId('activity'),
            createdAt: new Date().toISOString(),
        };
        this.activities.unshift(activity);
        return activity;
    }
    listProjects(tenantId) {
        return tenantId
            ? this.projects.filter((project) => project.tenantId === tenantId)
            : this.projects;
    }
    createProject(input) {
        this.getTenant(input.tenantId);
        const project = { ...input, id: this.nextId('project') };
        this.projects.push(project);
        return project;
    }
    listBuildings(tenantId, projectId) {
        return this.buildings.filter((building) => {
            return ((!tenantId || building.tenantId === tenantId) &&
                (!projectId || building.projectId === projectId));
        });
    }
    createBuilding(input) {
        this.getTenant(input.tenantId);
        const building = { ...input, id: this.nextId('building') };
        this.buildings.push(building);
        return building;
    }
    listFloors(tenantId, buildingId) {
        return this.floors.filter((floor) => {
            return ((!tenantId || floor.tenantId === tenantId) &&
                (!buildingId || floor.buildingId === buildingId));
        });
    }
    createFloor(input) {
        this.getTenant(input.tenantId);
        const floor = { ...input, id: this.nextId('floor') };
        this.floors.push(floor);
        return floor;
    }
    listUnits(tenantId, status) {
        return this.units.filter((unit) => {
            return ((!tenantId || unit.tenantId === tenantId) &&
                (!status || unit.status === status));
        });
    }
    createUnit(input) {
        this.getTenant(input.tenantId);
        const unit = { ...input, id: this.nextId('unit') };
        this.units.push(unit);
        return unit;
    }
    updateUnitStatus(id, status, availableFrom) {
        const unit = this.units.find((item) => item.id === id);
        if (!unit) {
            throw new common_1.NotFoundException(`Unit ${id} was not found`);
        }
        unit.status = status;
        if (availableFrom) {
            unit.availableFrom = availableFrom;
        }
        return unit;
    }
    listPropertyMedia(tenantId, projectId) {
        return this.propertyMedia.filter((media) => {
            return ((!tenantId || media.tenantId === tenantId) &&
                (!projectId || media.projectId === projectId));
        });
    }
    createPropertyMedia(input) {
        this.getTenant(input.tenantId);
        const media = {
            ...input,
            id: this.nextId('media'),
            updatedAt: new Date().toISOString(),
        };
        this.propertyMedia.push(media);
        return media;
    }
    nextId(prefix) {
        return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
    }
};
exports.InMemoryService = InMemoryService;
exports.InMemoryService = InMemoryService = __decorate([
    (0, common_1.Injectable)()
], InMemoryService);
//# sourceMappingURL=in-memory.service.js.map