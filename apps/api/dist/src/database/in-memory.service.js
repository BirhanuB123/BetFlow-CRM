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
    siteVisits = [
        {
            id: 'visit_001',
            tenantId: 'tenant_001',
            leadId: 'lead_001',
            unitId: 'unit_001',
            agentUserId: 'user_002',
            scheduledFor: new Date('2026-06-30T18:30:00.000Z').toISOString(),
            status: 'scheduled',
            outcome: 'Awaiting visit',
        },
        {
            id: 'visit_002',
            tenantId: 'tenant_001',
            leadId: 'lead_002',
            unitId: 'unit_003',
            agentUserId: 'user_002',
            scheduledFor: new Date('2026-07-01T15:00:00.000Z').toISOString(),
            status: 'scheduled',
            outcome: 'Confirmed by email',
        },
    ];
    reservations = [
        {
            id: 'reservation_001',
            tenantId: 'tenant_001',
            customerId: 'customer_002',
            unitId: 'unit_002',
            expiresAt: '2026-07-05',
            depositAmount: 50000,
            status: 'pending_payment',
            ownerUserId: 'user_001',
        },
        {
            id: 'reservation_002',
            tenantId: 'tenant_001',
            customerId: 'customer_001',
            unitId: 'unit_001',
            expiresAt: '2026-07-08',
            depositAmount: 35000,
            status: 'reserved',
            ownerUserId: 'user_002',
        },
    ];
    paymentSchedule = [
        {
            id: 'schedule_001',
            tenantId: 'tenant_001',
            reservationId: 'reservation_001',
            milestone: 'Reservation deposit',
            dueDate: '2026-07-05',
            amount: 50000,
            status: 'pending',
        },
        {
            id: 'schedule_002',
            tenantId: 'tenant_001',
            reservationId: 'reservation_002',
            milestone: 'Reservation deposit',
            dueDate: '2026-06-30',
            amount: 35000,
            status: 'paid',
        },
    ];
    paymentTransactions = [
        {
            id: 'payment_001',
            tenantId: 'tenant_001',
            reservationId: 'reservation_002',
            customerId: 'customer_001',
            method: 'bank_transfer',
            amount: 35000,
            receivedAt: new Date('2026-06-30T13:15:00.000Z').toISOString(),
            status: 'paid',
        },
        {
            id: 'payment_002',
            tenantId: 'tenant_001',
            reservationId: 'reservation_001',
            customerId: 'customer_002',
            method: 'check',
            amount: 25000,
            status: 'partially_paid',
        },
    ];
    receiptUploads = [
        {
            id: 'receipt_001',
            tenantId: 'tenant_001',
            paymentId: 'payment_001',
            fileName: 'kaplan-deposit-wire.pdf',
            uploadedByUserId: 'user_002',
            uploadedAt: new Date('2026-06-30T13:18:00.000Z').toISOString(),
            status: 'approved',
        },
        {
            id: 'receipt_002',
            tenantId: 'tenant_001',
            paymentId: 'payment_002',
            fileName: 'bell-check-scan.jpg',
            uploadedByUserId: 'user_001',
            uploadedAt: new Date('2026-06-30T14:02:00.000Z').toISOString(),
            status: 'under_review',
        },
    ];
    financeApprovals = [
        {
            id: 'approval_001',
            tenantId: 'tenant_001',
            reservationId: 'reservation_001',
            reviewerUserId: 'user_001',
            paymentId: 'payment_002',
            amount: 25000,
            submittedAt: new Date('2026-06-30T14:04:00.000Z').toISOString(),
            status: 'waiting',
            note: 'Partial deposit requires finance confirmation.',
        },
        {
            id: 'approval_002',
            tenantId: 'tenant_001',
            reservationId: 'reservation_002',
            reviewerUserId: 'user_001',
            paymentId: 'payment_001',
            amount: 35000,
            submittedAt: new Date('2026-06-30T13:22:00.000Z').toISOString(),
            status: 'approved',
            note: 'Wire receipt matched bank ledger.',
        },
    ];
    uploadedDocuments = [
        {
            id: 'document_001',
            tenantId: 'tenant_001',
            name: 'kaplan-passport.pdf',
            category: 'kyc',
            relatedTo: 'customer_001',
            uploadedByUserId: 'user_002',
            uploadedAt: new Date('2026-06-30T15:12:00.000Z').toISOString(),
            status: 'verified',
        },
        {
            id: 'document_002',
            tenantId: 'tenant_001',
            name: 'bell-reservation-form.pdf',
            category: 'reservation',
            relatedTo: 'reservation_001',
            uploadedByUserId: 'user_001',
            uploadedAt: new Date('2026-06-30T14:28:00.000Z').toISOString(),
            status: 'uploaded',
        },
    ];
    contractTemplates = [
        {
            id: 'template_001',
            tenantId: 'tenant_001',
            name: 'Standard reservation agreement',
            type: 'reservation',
            version: 'v2.4',
            status: 'active',
            updatedAt: new Date('2026-06-27T12:00:00.000Z').toISOString(),
        },
        {
            id: 'template_002',
            tenantId: 'tenant_001',
            name: 'Residential sale agreement',
            type: 'sale_agreement',
            version: 'v1.9',
            status: 'active',
            updatedAt: new Date('2026-06-22T12:00:00.000Z').toISOString(),
        },
    ];
    generatedContractPdfs = [
        {
            id: 'contract_pdf_001',
            tenantId: 'tenant_001',
            templateId: 'template_001',
            customerId: 'customer_002',
            unitId: 'unit_002',
            generatedAt: new Date('2026-06-30T15:05:00.000Z').toISOString(),
            status: 'sent',
        },
        {
            id: 'contract_pdf_002',
            tenantId: 'tenant_001',
            templateId: 'template_002',
            customerId: 'customer_001',
            unitId: 'unit_001',
            generatedAt: new Date('2026-06-30T13:44:00.000Z').toISOString(),
            status: 'generated',
        },
    ];
    legalContractApprovals = [
        {
            id: 'contract_approval_001',
            tenantId: 'tenant_001',
            generatedPdfId: 'contract_pdf_001',
            reviewerUserId: 'user_001',
            submittedAt: new Date('2026-06-30T15:08:00.000Z').toISOString(),
            status: 'waiting',
            note: 'Deposit clause requires confirmation.',
        },
        {
            id: 'contract_approval_002',
            tenantId: 'tenant_001',
            generatedPdfId: 'contract_pdf_002',
            reviewerUserId: 'user_001',
            submittedAt: new Date('2026-06-29T15:08:00.000Z').toISOString(),
            status: 'approved',
            note: 'Approved for signature.',
        },
    ];
    signedContracts = [
        {
            id: 'signed_contract_001',
            tenantId: 'tenant_001',
            generatedPdfId: 'contract_pdf_002',
            customerId: 'customer_001',
            signedAt: new Date('2026-06-30T16:14:00.000Z').toISOString(),
            storagePath: 'contracts/2026/kaplan-sale-agreement.pdf',
            status: 'stored',
        },
        {
            id: 'signed_contract_002',
            tenantId: 'tenant_001',
            generatedPdfId: 'contract_pdf_001',
            customerId: 'customer_002',
            storagePath: 'contracts/pending/bell-reservation-agreement.pdf',
            status: 'pending_countersign',
        },
    ];
    notificationMessages = [
        {
            id: 'notification_001',
            tenantId: 'tenant_001',
            channel: 'sms',
            recipient: 'Ari Kaplan',
            subject: 'Site visit reminder for A-1802',
            relatedTo: 'visit_001',
            scheduledFor: new Date('2026-06-30T17:30:00.000Z').toISOString(),
            status: 'scheduled',
        },
        {
            id: 'notification_002',
            tenantId: 'tenant_001',
            channel: 'telegram',
            recipient: 'Omar Haddad',
            subject: 'Kaplan deposit approved',
            relatedTo: 'payment_001',
            scheduledFor: new Date('2026-06-30T14:10:00.000Z').toISOString(),
            status: 'sent',
        },
        {
            id: 'notification_003',
            tenantId: 'tenant_001',
            channel: 'email',
            recipient: 'Bell Family Office',
            subject: 'Reservation deposit reminder',
            relatedTo: 'reservation_001',
            scheduledFor: new Date('2026-06-30T20:00:00.000Z').toISOString(),
            status: 'queued',
        },
    ];
    overduePaymentAlerts = [
        {
            id: 'overdue_001',
            tenantId: 'tenant_001',
            customerId: 'customer_002',
            reservationId: 'reservation_001',
            amount: 25000,
            overdueBy: '1 day',
            ownerUserId: 'user_001',
            priority: 'high',
        },
        {
            id: 'overdue_002',
            tenantId: 'tenant_001',
            customerId: 'customer_001',
            reservationId: 'reservation_002',
            amount: 145000,
            overdueBy: 'Due today',
            ownerUserId: 'user_002',
            priority: 'medium',
        },
    ];
    followUpReminders = [
        {
            id: 'followup_001',
            tenantId: 'tenant_001',
            leadId: 'lead_004',
            ownerUserId: 'user_002',
            dueAt: new Date('2026-06-30T19:00:00.000Z').toISOString(),
            reason: 'New lead has not been contacted',
            channel: 'sms',
            priority: 'medium',
        },
        {
            id: 'followup_002',
            tenantId: 'tenant_001',
            leadId: 'lead_003',
            ownerUserId: 'user_001',
            dueAt: new Date('2026-07-01T14:00:00.000Z').toISOString(),
            reason: 'Proposal follow-up after legal review',
            channel: 'email',
            priority: 'high',
        },
    ];
    salesDashboardReport = [
        {
            label: 'Booked revenue',
            value: '$4.2M',
            detail: 'Across active reservations',
        },
        { label: 'Collected', value: '$1.1M', detail: '26% of booked revenue' },
        { label: 'Open pipeline', value: '$7.8M', detail: 'Weighted at $3.9M' },
        { label: 'Conversion', value: '18.4%', detail: 'Lead to reservation' },
    ];
    agentPerformanceReport = [
        {
            agent: 'Maya Johnson',
            leads: 18,
            visits: 9,
            reservations: 4,
            revenue: 2400000,
            conversionRate: 22,
        },
        {
            agent: 'Omar Haddad',
            leads: 24,
            visits: 12,
            reservations: 5,
            revenue: 1800000,
            conversionRate: 21,
        },
        {
            agent: 'Noah Smith',
            leads: 16,
            visits: 8,
            reservations: 2,
            revenue: 920000,
            conversionRate: 13,
        },
    ];
    revenueReportRows = [
        {
            period: '2026-06',
            booked: 1900000,
            collected: 720000,
            outstanding: 1180000,
            forecast: 2300000,
        },
        {
            period: '2026-07',
            booked: 1400000,
            collected: 280000,
            outstanding: 1120000,
            forecast: 2700000,
        },
        {
            period: '2026-08',
            booked: 900000,
            collected: 100000,
            outstanding: 800000,
            forecast: 2100000,
        },
    ];
    inventoryReportRows = [
        {
            project: 'Harbor Point',
            totalUnits: 184,
            available: 47,
            reserved: 18,
            sold: 104,
            blocked: 15,
        },
        {
            project: 'Meridian Residences',
            totalUnits: 96,
            available: 22,
            reserved: 9,
            sold: 58,
            blocked: 7,
        },
        {
            project: 'District 7 Offices',
            totalUnits: 58,
            available: 58,
            reserved: 0,
            sold: 0,
            blocked: 0,
        },
    ];
    conversionReportRows = [
        { stage: 'Lead captured', count: 248, rate: 100, dropOff: 0 },
        { stage: 'Qualified', count: 142, rate: 57, dropOff: 43 },
        { stage: 'Site visit', count: 76, rate: 31, dropOff: 46 },
        { stage: 'Reservation', count: 46, rate: 18, dropOff: 39 },
        { stage: 'Contract signed', count: 32, rate: 13, dropOff: 30 },
    ];
    paymentAgingReportRows = [
        { bucket: 'Current', invoices: 12, amount: 680000, risk: 'low' },
        { bucket: '1-15 days', invoices: 5, amount: 240000, risk: 'medium' },
        { bucket: '16-30 days', invoices: 2, amount: 95000, risk: 'medium' },
        { bucket: '31+ days', invoices: 1, amount: 25000, risk: 'high' },
    ];
    subscriptionPlans = [
        {
            id: 'plan_growth',
            tenantId: 'tenant_001',
            name: 'Growth',
            price: 499,
            billingCycle: 'monthly',
            status: 'current',
            includes: [
                '25 users',
                '500 active leads',
                '3 custom domains',
                'API access',
            ],
        },
        {
            id: 'plan_scale',
            name: 'Scale',
            price: 899,
            billingCycle: 'monthly',
            status: 'available',
            includes: [
                '75 users',
                '2,000 active leads',
                '10 custom domains',
                'Priority support',
            ],
        },
        {
            id: 'plan_enterprise',
            name: 'Enterprise',
            price: null,
            billingCycle: 'annual',
            status: 'available',
            includes: [
                'Unlimited users',
                'Dedicated tenant controls',
                'SAML SSO',
                'Data residency',
            ],
        },
    ];
    featureLimits = [
        {
            id: 'limit_users',
            tenantId: 'tenant_001',
            feature: 'Users',
            used: 24,
            limit: 25,
            unit: 'seats',
        },
        {
            id: 'limit_leads',
            tenantId: 'tenant_001',
            feature: 'Active leads',
            used: 248,
            limit: 500,
            unit: 'leads',
        },
        {
            id: 'limit_storage',
            tenantId: 'tenant_001',
            feature: 'Storage',
            used: 82,
            limit: 250,
            unit: 'GB',
        },
        {
            id: 'limit_domains',
            tenantId: 'tenant_001',
            feature: 'Custom domains',
            used: 1,
            limit: 3,
            unit: 'domains',
        },
    ];
    brandingSettings = [
        {
            id: 'brand_name',
            tenantId: 'tenant_001',
            label: 'Workspace name',
            value: 'BetFlow Realty',
            status: 'live',
        },
        {
            id: 'brand_color',
            tenantId: 'tenant_001',
            label: 'Primary color',
            value: '#18181b',
            status: 'live',
        },
        {
            id: 'brand_logo',
            tenantId: 'tenant_001',
            label: 'Logo',
            value: 'betflow_logo.svg',
            status: 'live',
        },
        {
            id: 'brand_login',
            tenantId: 'tenant_001',
            label: 'Login message',
            value: 'Welcome to BetFlow Realty',
            status: 'draft',
        },
    ];
    tenantBillingItems = [
        {
            id: 'billing_001',
            tenantId: 'tenant_001',
            invoice: 'INV-2026-006',
            period: 'June 2026',
            amount: 499,
            status: 'paid',
            dueDate: '2026-06-30',
        },
        {
            id: 'billing_002',
            tenantId: 'tenant_001',
            invoice: 'INV-2026-007',
            period: 'July 2026',
            amount: 499,
            status: 'due',
            dueDate: '2026-07-31',
        },
        {
            id: 'billing_003',
            tenantId: 'tenant_001',
            invoice: 'ADD-2026-012',
            period: 'Storage overage',
            amount: 42,
            status: 'due',
            dueDate: '2026-07-31',
        },
    ];
    tenantDomains = [
        {
            id: 'domain_001',
            tenantId: 'tenant_001',
            domain: 'crm.betflowrealty.com',
            status: 'verified',
            ssl: 'active',
            target: 'tenant.betflow.app',
        },
        {
            id: 'domain_002',
            tenantId: 'tenant_001',
            domain: 'sales.betflowrealty.com',
            status: 'pending_dns',
            ssl: 'pending',
            target: 'tenant.betflow.app',
        },
    ];
    dataTransferJobs = [
        {
            id: 'export_001',
            tenantId: 'tenant_001',
            type: 'export',
            scope: 'Customers and deals',
            requestedByUserId: 'user_001',
            requestedAt: new Date('2026-06-30T12:10:00.000Z').toISOString(),
            status: 'ready',
        },
        {
            id: 'import_001',
            tenantId: 'tenant_001',
            type: 'import',
            scope: 'Legacy leads CSV',
            requestedByUserId: 'user_002',
            requestedAt: new Date('2026-06-29T12:10:00.000Z').toISOString(),
            status: 'processing',
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
    listSiteVisits(tenantId) {
        return tenantId
            ? this.siteVisits.filter((visit) => visit.tenantId === tenantId)
            : this.siteVisits;
    }
    createSiteVisit(input) {
        this.getTenant(input.tenantId);
        const visit = { ...input, id: this.nextId('visit') };
        this.siteVisits.push(visit);
        return visit;
    }
    updateSiteVisitStatus(id, status, outcome) {
        const visit = this.siteVisits.find((item) => item.id === id);
        if (!visit) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        visit.status = status;
        if (outcome) {
            visit.outcome = outcome;
        }
        return visit;
    }
    listReservations(tenantId) {
        return tenantId
            ? this.reservations.filter((reservation) => reservation.tenantId === tenantId)
            : this.reservations;
    }
    createReservation(input) {
        this.getTenant(input.tenantId);
        const reservation = {
            ...input,
            id: this.nextId('reservation'),
        };
        this.reservations.push(reservation);
        this.updateUnitStatus(input.unitId, 'reserved', input.expiresAt);
        return reservation;
    }
    updateReservationStatus(id, status) {
        const reservation = this.reservations.find((item) => item.id === id);
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation ${id} was not found`);
        }
        reservation.status = status;
        if (status === 'reserved') {
            this.updateUnitStatus(reservation.unitId, 'reserved', reservation.expiresAt);
        }
        if (status === 'expired') {
            this.updateUnitStatus(reservation.unitId, 'available');
        }
        return reservation;
    }
    listPaymentSchedule(tenantId, reservationId) {
        return this.paymentSchedule.filter((item) => {
            return ((!tenantId || item.tenantId === tenantId) &&
                (!reservationId || item.reservationId === reservationId));
        });
    }
    createPaymentScheduleItem(input) {
        this.getTenant(input.tenantId);
        const item = {
            ...input,
            id: this.nextId('schedule'),
        };
        this.paymentSchedule.push(item);
        return item;
    }
    listPaymentTransactions(tenantId, reservationId) {
        return this.paymentTransactions.filter((payment) => {
            return ((!tenantId || payment.tenantId === tenantId) &&
                (!reservationId || payment.reservationId === reservationId));
        });
    }
    createPaymentTransaction(input) {
        this.getTenant(input.tenantId);
        const payment = {
            ...input,
            id: this.nextId('payment'),
        };
        this.paymentTransactions.push(payment);
        return payment;
    }
    listReceiptUploads(tenantId, paymentId) {
        return this.receiptUploads.filter((receipt) => {
            return ((!tenantId || receipt.tenantId === tenantId) &&
                (!paymentId || receipt.paymentId === paymentId));
        });
    }
    createReceiptUpload(input) {
        this.getTenant(input.tenantId);
        const receipt = {
            ...input,
            id: this.nextId('receipt'),
            uploadedAt: new Date().toISOString(),
        };
        this.receiptUploads.push(receipt);
        return receipt;
    }
    listFinanceApprovals(tenantId) {
        return tenantId
            ? this.financeApprovals.filter((approval) => approval.tenantId === tenantId)
            : this.financeApprovals;
    }
    createFinanceApproval(input) {
        this.getTenant(input.tenantId);
        const approval = {
            ...input,
            id: this.nextId('approval'),
            submittedAt: new Date().toISOString(),
        };
        this.financeApprovals.push(approval);
        return approval;
    }
    updateFinanceApprovalStatus(id, status, note) {
        const approval = this.financeApprovals.find((item) => item.id === id);
        if (!approval) {
            throw new common_1.NotFoundException(`Finance approval ${id} was not found`);
        }
        approval.status = status;
        if (note) {
            approval.note = note;
        }
        return approval;
    }
    listUploadedDocuments(tenantId) {
        return tenantId
            ? this.uploadedDocuments.filter((document) => document.tenantId === tenantId)
            : this.uploadedDocuments;
    }
    createUploadedDocument(input) {
        this.getTenant(input.tenantId);
        const document = {
            ...input,
            id: this.nextId('document'),
            uploadedAt: new Date().toISOString(),
        };
        this.uploadedDocuments.push(document);
        return document;
    }
    updateUploadedDocumentStatus(id, status) {
        const document = this.uploadedDocuments.find((item) => item.id === id);
        if (!document) {
            throw new common_1.NotFoundException(`Document ${id} was not found`);
        }
        document.status = status;
        return document;
    }
    listContractTemplates(tenantId) {
        return tenantId
            ? this.contractTemplates.filter((template) => template.tenantId === tenantId)
            : this.contractTemplates;
    }
    createContractTemplate(input) {
        this.getTenant(input.tenantId);
        const template = {
            ...input,
            id: this.nextId('template'),
            updatedAt: new Date().toISOString(),
        };
        this.contractTemplates.push(template);
        return template;
    }
    listGeneratedContractPdfs(tenantId) {
        return tenantId
            ? this.generatedContractPdfs.filter((pdf) => pdf.tenantId === tenantId)
            : this.generatedContractPdfs;
    }
    generateContractPdf(input) {
        this.getTenant(input.tenantId);
        const pdf = {
            ...input,
            id: this.nextId('contract_pdf'),
            generatedAt: new Date().toISOString(),
        };
        this.generatedContractPdfs.push(pdf);
        return pdf;
    }
    listLegalContractApprovals(tenantId) {
        return tenantId
            ? this.legalContractApprovals.filter((approval) => approval.tenantId === tenantId)
            : this.legalContractApprovals;
    }
    createLegalContractApproval(input) {
        this.getTenant(input.tenantId);
        const approval = {
            ...input,
            id: this.nextId('contract_approval'),
            submittedAt: new Date().toISOString(),
        };
        this.legalContractApprovals.push(approval);
        return approval;
    }
    updateLegalContractApprovalStatus(id, status, note) {
        const approval = this.legalContractApprovals.find((item) => item.id === id);
        if (!approval) {
            throw new common_1.NotFoundException(`Legal approval ${id} was not found`);
        }
        approval.status = status;
        if (note) {
            approval.note = note;
        }
        return approval;
    }
    listSignedContracts(tenantId) {
        return tenantId
            ? this.signedContracts.filter((contract) => contract.tenantId === tenantId)
            : this.signedContracts;
    }
    createSignedContract(input) {
        this.getTenant(input.tenantId);
        const contract = {
            ...input,
            id: this.nextId('signed_contract'),
        };
        this.signedContracts.push(contract);
        return contract;
    }
    listNotificationMessages(tenantId, channel) {
        return this.notificationMessages.filter((message) => {
            return ((!tenantId || message.tenantId === tenantId) &&
                (!channel || message.channel === channel));
        });
    }
    createNotificationMessage(input) {
        this.getTenant(input.tenantId);
        const message = {
            ...input,
            id: this.nextId('notification'),
        };
        this.notificationMessages.push(message);
        return message;
    }
    updateNotificationStatus(id, status) {
        const message = this.notificationMessages.find((item) => item.id === id);
        if (!message) {
            throw new common_1.NotFoundException(`Notification ${id} was not found`);
        }
        message.status = status;
        return message;
    }
    listOverduePaymentAlerts(tenantId) {
        return tenantId
            ? this.overduePaymentAlerts.filter((alert) => alert.tenantId === tenantId)
            : this.overduePaymentAlerts;
    }
    createOverduePaymentAlert(input) {
        this.getTenant(input.tenantId);
        const alert = {
            ...input,
            id: this.nextId('overdue'),
        };
        this.overduePaymentAlerts.push(alert);
        return alert;
    }
    listFollowUpReminders(tenantId) {
        return tenantId
            ? this.followUpReminders.filter((reminder) => reminder.tenantId === tenantId)
            : this.followUpReminders;
    }
    createFollowUpReminder(input) {
        this.getTenant(input.tenantId);
        const reminder = {
            ...input,
            id: this.nextId('followup'),
        };
        this.followUpReminders.push(reminder);
        return reminder;
    }
    getSalesDashboardReport() {
        return this.salesDashboardReport;
    }
    getAgentPerformanceReport() {
        return this.agentPerformanceReport;
    }
    getRevenueReport() {
        return this.revenueReportRows;
    }
    getInventoryReport() {
        return this.inventoryReportRows;
    }
    getConversionReport() {
        return this.conversionReportRows;
    }
    getPaymentAgingReport() {
        return this.paymentAgingReportRows;
    }
    listSubscriptionPlans(tenantId) {
        return this.subscriptionPlans.filter((plan) => {
            return !plan.tenantId || !tenantId || plan.tenantId === tenantId;
        });
    }
    listFeatureLimits(tenantId) {
        return tenantId
            ? this.featureLimits.filter((limit) => limit.tenantId === tenantId)
            : this.featureLimits;
    }
    listBrandingSettings(tenantId) {
        return tenantId
            ? this.brandingSettings.filter((setting) => setting.tenantId === tenantId)
            : this.brandingSettings;
    }
    updateBrandingSetting(id, value, status) {
        const setting = this.brandingSettings.find((item) => item.id === id);
        if (!setting) {
            throw new common_1.NotFoundException(`Branding setting ${id} was not found`);
        }
        setting.value = value;
        if (status) {
            setting.status = status;
        }
        return setting;
    }
    listTenantBillingItems(tenantId) {
        return tenantId
            ? this.tenantBillingItems.filter((item) => item.tenantId === tenantId)
            : this.tenantBillingItems;
    }
    listTenantDomains(tenantId) {
        return tenantId
            ? this.tenantDomains.filter((domain) => domain.tenantId === tenantId)
            : this.tenantDomains;
    }
    createTenantDomain(input) {
        this.getTenant(input.tenantId);
        const domain = { ...input, id: this.nextId('domain') };
        this.tenantDomains.push(domain);
        return domain;
    }
    listDataTransferJobs(tenantId) {
        return tenantId
            ? this.dataTransferJobs.filter((job) => job.tenantId === tenantId)
            : this.dataTransferJobs;
    }
    createDataTransferJob(input) {
        this.getTenant(input.tenantId);
        const job = {
            ...input,
            id: this.nextId(input.type),
            requestedAt: new Date().toISOString(),
        };
        this.dataTransferJobs.push(job);
        return job;
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