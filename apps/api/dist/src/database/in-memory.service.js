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
            slug: 'betflow',
            region: 'US East',
            plan: 'Growth',
            status: 'active',
            ownerUserId: 'user_001',
            domain: 'crm.betflowrealty.com',
            currency: 'ETB',
        }
    ];
    roles = [
        {
            id: 'role_owner',
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
            name: 'Agent',
            description: 'Default sales workspace access.',
            permissionKeys: ['dashboard.read'],
        },
    ];
    users = [
        {
            id: 'user_001',
            name: 'Maya Johnson',
            email: 'maya@betflow.example',
            roleId: 'role_owner',
            status: 'active',
        },
        {
            id: 'user_002',
            name: 'Omar Haddad',
            email: 'omar@betflow.example',
            roleId: 'role_admin',
            status: 'active',
        },
    ];
    auditLogs = [
        {
            id: 'audit_001',
            actor: 'Maya Johnson',
            action: 'Registered tenant',
            target: 'BetFlow Realty',
            severity: 'info',
            createdAt: new Date('2026-06-29T08:00:00.000Z').toISOString(),
        },
        {
            id: 'audit_002',
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
            name: 'Kaplan Holdings',
            email: 'ari@kaplan.example',
            phone: '+1 555 0182',
            type: 'investor',
            ownerUserId: 'user_002',
            status: 'onboarding',
        },
        {
            id: 'customer_002',
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
            relatedTo: 'customer_001',
            authorUserId: 'user_002',
            body: 'Buyer wants two comparable investment options before the next call.',
            createdAt: new Date('2026-06-30T10:22:00.000Z').toISOString(),
        },
    ];
    activities = [
        {
            id: 'activity_001',
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
            name: 'Harbor Point',
            location: 'Miami, FL',
            status: 'selling',
        },
        {
            id: 'project_002',
            name: 'Meridian Residences',
            location: 'Austin, TX',
            status: 'active',
        },
    ];
    buildings = [
        {
            id: 'building_001',
            projectId: 'project_001',
            name: 'Harbor Tower A',
            address: '210 Bayfront Ave',
            floors: 24,
            status: 'open',
        },
        {
            id: 'building_002',
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
            buildingId: 'building_001',
            label: 'Floor 18',
            releaseStatus: 'released',
        },
        {
            id: 'floor_002',
            buildingId: 'building_002',
            label: 'Floor 9',
            releaseStatus: 'released',
        },
    ];
    units = [
        {
            id: 'unit_001',
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
            projectId: 'project_001',
            title: 'Harbor Point exterior gallery',
            type: 'photo',
            usage: 'public',
            url: '/media/harbor-point-gallery',
            updatedAt: new Date('2026-06-30T09:30:00.000Z').toISOString(),
        },
        {
            id: 'media_002',
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
            leadId: 'lead_001',
            unitId: 'unit_001',
            agentUserId: 'user_002',
            scheduledFor: new Date('2026-06-30T18:30:00.000Z').toISOString(),
            status: 'scheduled',
            outcome: 'Awaiting visit',
        },
        {
            id: 'visit_002',
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
            customerId: 'customer_002',
            unitId: 'unit_002',
            expiresAt: '2026-07-05',
            depositAmount: 50000,
            status: 'pending_payment',
            ownerUserId: 'user_001',
        },
        {
            id: 'reservation_002',
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
            reservationId: 'reservation_001',
            milestone: 'Reservation deposit',
            dueDate: '2026-07-05',
            amount: 50000,
            status: 'pending',
        },
        {
            id: 'schedule_002',
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
            reservationId: 'reservation_002',
            customerId: 'customer_001',
            method: 'bank_transfer',
            amount: 35000,
            receivedAt: new Date('2026-06-30T13:15:00.000Z').toISOString(),
            status: 'paid',
        },
        {
            id: 'payment_002',
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
            paymentId: 'payment_001',
            fileName: 'kaplan-deposit-wire.pdf',
            uploadedByUserId: 'user_002',
            uploadedAt: new Date('2026-06-30T13:18:00.000Z').toISOString(),
            status: 'approved',
        },
        {
            id: 'receipt_002',
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
            name: 'kaplan-passport.pdf',
            category: 'kyc',
            relatedTo: 'customer_001',
            uploadedByUserId: 'user_002',
            uploadedAt: new Date('2026-06-30T15:12:00.000Z').toISOString(),
            status: 'verified',
        },
        {
            id: 'document_002',
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
            name: 'Standard reservation agreement',
            type: 'reservation',
            version: 'v2.4',
            status: 'active',
            updatedAt: new Date('2026-06-27T12:00:00.000Z').toISOString(),
        },
        {
            id: 'template_002',
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
            templateId: 'template_001',
            customerId: 'customer_002',
            unitId: 'unit_002',
            generatedAt: new Date('2026-06-30T15:05:00.000Z').toISOString(),
            status: 'sent',
        },
        {
            id: 'contract_pdf_002',
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
            generatedPdfId: 'contract_pdf_001',
            reviewerUserId: 'user_001',
            submittedAt: new Date('2026-06-30T15:08:00.000Z').toISOString(),
            status: 'waiting',
            note: 'Deposit clause requires confirmation.',
        },
        {
            id: 'contract_approval_002',
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
            generatedPdfId: 'contract_pdf_002',
            customerId: 'customer_001',
            signedAt: new Date('2026-06-30T16:14:00.000Z').toISOString(),
            storagePath: 'contracts/2026/kaplan-sale-agreement.pdf',
            status: 'stored',
        },
        {
            id: 'signed_contract_002',
            generatedPdfId: 'contract_pdf_001',
            customerId: 'customer_002',
            storagePath: 'contracts/pending/bell-reservation-agreement.pdf',
            status: 'pending_countersign',
        },
    ];
    notificationMessages = [
        {
            id: 'notification_001',
            channel: 'sms',
            recipient: 'Ari Kaplan',
            subject: 'Site visit reminder for A-1802',
            relatedTo: 'visit_001',
            scheduledFor: new Date('2026-06-30T17:30:00.000Z').toISOString(),
            status: 'scheduled',
        },
        {
            id: 'notification_002',
            channel: 'telegram',
            recipient: 'Omar Haddad',
            subject: 'Kaplan deposit approved',
            relatedTo: 'payment_001',
            scheduledFor: new Date('2026-06-30T14:10:00.000Z').toISOString(),
            status: 'sent',
        },
        {
            id: 'notification_003',
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
            customerId: 'customer_002',
            reservationId: 'reservation_001',
            amount: 25000,
            overdueBy: '1 day',
            ownerUserId: 'user_001',
            priority: 'high',
        },
        {
            id: 'overdue_002',
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
            leadId: 'lead_004',
            ownerUserId: 'user_002',
            dueAt: new Date('2026-06-30T19:00:00.000Z').toISOString(),
            reason: 'New lead has not been contacted',
            channel: 'sms',
            priority: 'medium',
        },
        {
            id: 'followup_002',
            leadId: 'lead_003',
            ownerUserId: 'user_001',
            dueAt: new Date('2026-07-01T14:00:00.000Z').toISOString(),
            reason: 'Proposal follow-up after legal review',
            channel: 'email',
            priority: 'high',
        },
    ];
    reportCatalog = [
        {
            id: 'sales-dashboard',
            name: 'Sales Dashboard',
            description: 'Booked revenue, collected payments, and sales productivity at a glance.',
            folder: 'Sales Metrics Reports',
            href: '/reports/sales',
            lastAccessedAt: '2026-06-29',
            createdBy: null,
        },
        {
            id: 'agent-performance',
            name: 'Agent Performance',
            description: 'Leads, visits, reservations, and revenue contributed by each sales agent.',
            folder: 'Sales Metrics Reports',
            href: '/reports/agents',
            lastAccessedAt: '2026-06-28',
            createdBy: null,
        },
        {
            id: 'revenue-by-period',
            name: 'Revenue by Period',
            description: 'Monthly booked, collected, outstanding, and forecast revenue.',
            folder: 'Revenue Reports',
            href: '/reports/revenue',
            lastAccessedAt: '2026-06-30',
            createdBy: null,
        },
        {
            id: 'inventory-status',
            name: 'Inventory Status',
            description: 'Unit availability, reservations, and sales across active projects.',
            folder: 'Inventory Reports',
            href: '/reports/inventory',
            lastAccessedAt: null,
            createdBy: null,
        },
        {
            id: 'lead-conversion-funnel',
            name: 'Lead Conversion Funnel',
            description: 'Stage-by-stage conversion and drop-off from lead to signed contract.',
            folder: 'Sales Metrics Reports',
            href: '/reports/conversion',
            lastAccessedAt: null,
            createdBy: null,
        },
        {
            id: 'payment-aging',
            name: 'Payment Aging',
            description: 'Outstanding invoices bucketed by age with collection risk levels.',
            folder: 'Revenue Reports',
            href: '/reports/payment-aging',
            lastAccessedAt: null,
            createdBy: null,
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
            feature: 'Users',
            used: 24,
            limit: 25,
            unit: 'seats',
        },
        {
            id: 'limit_leads',
            feature: 'Active leads',
            used: 248,
            limit: 500,
            unit: 'leads',
        },
        {
            id: 'limit_storage',
            feature: 'Storage',
            used: 82,
            limit: 250,
            unit: 'GB',
        },
        {
            id: 'limit_domains',
            feature: 'Custom domains',
            used: 1,
            limit: 3,
            unit: 'domains',
        },
    ];
    brandingSettings = [
        {
            id: 'brand_name',
            label: 'Workspace name',
            value: 'BetFlow Realty',
            status: 'live',
        },
        {
            id: 'brand_color',
            label: 'Primary color',
            value: '#18181b',
            status: 'live',
        },
        {
            id: 'brand_logo',
            label: 'Logo',
            value: 'betflow_logo.svg',
            status: 'live',
        },
        {
            id: 'brand_login',
            label: 'Login message',
            value: 'Welcome to BetFlow Realty',
            status: 'draft',
        },
    ];
    tenantBillingItems = [
        {
            id: 'billing_001',
            invoice: 'INV-2026-006',
            period: 'June 2026',
            amount: 499,
            status: 'paid',
            dueDate: '2026-06-30',
        },
        {
            id: 'billing_002',
            invoice: 'INV-2026-007',
            period: 'July 2026',
            amount: 499,
            status: 'due',
            dueDate: '2026-07-31',
        },
        {
            id: 'billing_003',
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
            domain: 'crm.betflowrealty.com',
            status: 'verified',
            ssl: 'active',
            target: 'tenant.betflow.app',
        },
        {
            id: 'domain_002',
            domain: 'sales.betflowrealty.com',
            status: 'pending_dns',
            ssl: 'pending',
            target: 'tenant.betflow.app',
        },
    ];
    dataTransferJobs = [
        {
            id: 'export_001',
            type: 'export',
            scope: 'Customers and deals',
            requestedByUserId: 'user_001',
            requestedAt: new Date('2026-06-30T12:10:00.000Z').toISOString(),
            status: 'ready',
        },
        {
            id: 'import_001',
            type: 'import',
            scope: 'Legacy leads CSV',
            requestedByUserId: 'user_002',
            requestedAt: new Date('2026-06-29T12:10:00.000Z').toISOString(),
            status: 'processing',
        },
    ];
    featureFlags = [
        {
            key: 'customer_portal',
            label: 'Customer portal',
            description: 'Enable buyer login, payment schedules, document downloads, and support requests.',
            enabled: true,
            scope: 'Tenant',
            rollout: '100%',
        },
        {
            key: 'mobile_pwa',
            label: 'Agent mobile PWA',
            description: 'Allow installable mobile shell, push notifications, and offline visit notes.',
            enabled: false,
            scope: 'Beta cohort',
            rollout: '20%',
        },
        {
            key: 'advanced_forecasting',
            label: 'Advanced forecasting',
            description: 'Use weighted pipeline, payment schedules, and unit absorption predictions.',
            enabled: true,
            scope: 'Plan',
            rollout: 'Growth+',
        },
        {
            key: 'api_marketplace',
            label: 'API marketplace',
            description: 'Expose webhook subscriptions, partner app scopes, and API keys.',
            enabled: false,
            scope: 'Tenant',
            rollout: 'Internal preview',
        },
    ];
    onboardingSteps = [
        { step: 'Create tenant workspace', owner: 'Platform', status: 'Complete', due: 'Done' },
        { step: 'Invite admin users', owner: 'Tenant admin', status: 'Complete', due: 'Done' },
        { step: 'Configure roles and permissions', owner: 'Tenant admin', status: 'In progress', due: '2026-07-02' },
        { step: 'Publish branding and domain', owner: 'Brand admin', status: 'In progress', due: '2026-07-03' },
        { step: 'Import leads and inventory from Excel', owner: 'Sales ops', status: 'Not started', due: '2026-07-05' },
        { step: 'Enable automation and portal', owner: 'Operations', status: 'Blocked', due: 'Needs DNS' },
    ];
    excelImportTemplates = [
        {
            template: 'Lead import workbook',
            entity: 'Leads',
            requiredColumns: ['firstName', 'lastName', 'phone', 'source', 'budget'],
            lastRun: 'Yesterday',
            status: 'Ready',
        },
        {
            template: 'Customer import workbook',
            entity: 'Customers',
            requiredColumns: ['firstName', 'lastName', 'email', 'phone', 'nationalId'],
            lastRun: '2026-06-28',
            status: 'Ready',
        },
        {
            template: 'Unit inventory workbook',
            entity: 'Units',
            requiredColumns: ['project', 'building', 'floor', 'unitNumber', 'price', 'status'],
            lastRun: 'Today',
            status: 'Processing',
        },
        {
            template: 'Payment schedule workbook',
            entity: 'Payments',
            requiredColumns: ['contractRef', 'dueDate', 'amount', 'installmentNumber'],
            lastRun: 'Never',
            status: 'Ready',
        },
    ];
    trialPeriod = {
        status: 'Active',
        startedAt: '2026-06-26',
        endsAt: '2026-07-10',
        daysRemaining: 9,
        conversionOwner: 'Maya Johnson',
    };
    billingAccount = {
        accountName: 'BetFlow Realty LLC',
        billingEmail: 'finance@betflowrealty.com',
        taxId: 'US-88214-CRM',
        paymentMethod: 'Visa ending 4242',
        collectionMode: 'Auto-charge',
        nextCharge: '2026-07-31',
    };
    registerTenant(input) {
        const ownerRoleId = this.nextId('role');
        const ownerUserId = this.nextId('user');
        const tenant = {
            id: this.nextId('tenant'),
            name: input.companyName,
            slug: input.slug,
            region: input.region ?? 'US East',
            plan: input.plan ?? 'Starter',
            status: 'active',
            ownerUserId,
        };
        const ownerRole = {
            id: ownerRoleId,
            name: 'Owner',
            description: 'Full tenant administration access.',
            permissionKeys: this.permissions.map((permission) => permission.key),
        };
        const owner = {
            id: ownerUserId,
            name: input.ownerName,
            email: input.ownerEmail,
            roleId: ownerRoleId,
            status: 'active',
        };
        this.tenants.push(tenant);
        this.roles.push(ownerRole);
        this.users.push(owner);
        this.recordAudit({ actor: owner.name,
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
            actor: 'System',
            action: 'Updated tenant settings',
            target: tenant.name,
            severity: 'info',
        });
        return tenant;
    }
    listUsers() {
        return this.users;
    }
    inviteUser(input) {
        const role = this.roles.find((item) => item.id === input.roleId);
        if (!role) {
            throw new common_1.NotFoundException(`Role ${input.roleId} was not found`);
        }
        const user = {
            id: this.nextId('user'),
            name: input.name,
            email: input.email,
            roleId: input.roleId,
            status: 'invited',
        };
        this.users.push(user);
        this.recordAudit({
            actor: 'System',
            action: 'Invited user',
            target: input.email,
            severity: 'info',
        });
        return user;
    }
    listRoles() {
        return this.roles;
    }
    createRole(input) {
        const role = { ...input, id: this.nextId('role') };
        this.roles.push(role);
        this.recordAudit({
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
    listAuditLogs() {
        return this.auditLogs;
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
    listLeads() {
        return this.leads;
    }
    createLead(input) {
        const lead = { ...input, id: this.nextId('lead') };
        this.leads.push(lead);
        this.recordActivity({
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
            actorUserId: assignedToUserId,
            action: 'Assigned lead',
            target: lead.id,
            type: 'assignment',
        });
        return lead;
    }
    listCustomers() {
        return this.customers;
    }
    createCustomer(input) {
        const customer = { ...input, id: this.nextId('customer') };
        this.customers.push(customer);
        return customer;
    }
    listDeals() {
        return this.deals;
    }
    createDeal(input) {
        const deal = { ...input, id: this.nextId('deal') };
        this.deals.push(deal);
        this.recordActivity({
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
            actorUserId: deal.ownerUserId,
            action: `Moved deal to ${stage}`,
            target: deal.id,
            type: 'deal',
        });
        return deal;
    }
    listTasks() {
        return this.tasks;
    }
    createTask(input) {
        const task = { ...input, id: this.nextId('task') };
        this.tasks.push(task);
        this.recordActivity({
            actorUserId: input.ownerUserId,
            action: 'Created task',
            target: task.id,
            type: 'task',
        });
        return task;
    }
    listNotes() {
        return this.notes;
    }
    createNote(input) {
        const note = {
            ...input,
            id: this.nextId('note'),
            createdAt: new Date().toISOString(),
        };
        this.notes.push(note);
        this.recordActivity({
            actorUserId: input.authorUserId,
            action: 'Added note',
            target: input.relatedTo,
            type: 'note',
        });
        return note;
    }
    listActivities() {
        return this.activities;
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
    listProjects() {
        return this.projects;
    }
    createProject(input) {
        const project = { ...input, id: this.nextId('project') };
        this.projects.push(project);
        return project;
    }
    listBuildings(projectId) {
        return this.buildings.filter((building) => {
            return ((!projectId || building.projectId === projectId));
        });
    }
    createBuilding(input) {
        const building = { ...input, id: this.nextId('building') };
        this.buildings.push(building);
        return building;
    }
    listFloors(buildingId) {
        return this.floors.filter((floor) => {
            return ((!buildingId || floor.buildingId === buildingId));
        });
    }
    createFloor(input) {
        const floor = { ...input, id: this.nextId('floor') };
        this.floors.push(floor);
        return floor;
    }
    listUnits(status) {
        return this.units.filter((unit) => {
            return ((!status || unit.status === status));
        });
    }
    createUnit(input) {
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
    listPropertyMedia(projectId) {
        return this.propertyMedia.filter((media) => {
            return ((!projectId || media.projectId === projectId));
        });
    }
    createPropertyMedia(input) {
        const media = {
            ...input,
            id: this.nextId('media'),
            updatedAt: new Date().toISOString(),
        };
        this.propertyMedia.push(media);
        return media;
    }
    listSiteVisits() {
        return this.siteVisits;
    }
    createSiteVisit(input) {
        const visit = { ...input, id: this.nextId('visit') };
        this.siteVisits.push(visit);
        return visit;
    }
    updateSiteVisitStatus(id, status) {
        const visit = this.siteVisits.find((item) => item.id === id);
        if (!visit) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        visit.status = status;
        return visit;
    }
    listReservations() {
        return this.reservations;
    }
    createReservation(input) {
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
    listPaymentSchedule(reservationId) {
        return this.paymentSchedule.filter((item) => {
            return ((!reservationId || item.reservationId === reservationId));
        });
    }
    createPaymentScheduleItem(input) {
        const item = {
            ...input,
            id: this.nextId('schedule'),
        };
        this.paymentSchedule.push(item);
        return item;
    }
    listPaymentTransactions(reservationId) {
        return this.paymentTransactions.filter((payment) => {
            return ((!reservationId || payment.reservationId === reservationId));
        });
    }
    createPaymentTransaction(input) {
        const payment = {
            ...input,
            id: this.nextId('payment'),
        };
        this.paymentTransactions.push(payment);
        return payment;
    }
    listReceiptUploads(paymentId) {
        return this.receiptUploads.filter((receipt) => {
            return ((!paymentId || receipt.paymentId === paymentId));
        });
    }
    createReceiptUpload(input) {
        const receipt = {
            ...input,
            id: this.nextId('receipt'),
            uploadedAt: new Date().toISOString(),
        };
        this.receiptUploads.push(receipt);
        return receipt;
    }
    listFinanceApprovals() {
        return this.financeApprovals;
    }
    createFinanceApproval(input) {
        const approval = {
            ...input,
            id: this.nextId('approval'),
            submittedAt: new Date().toISOString(),
        };
        this.financeApprovals.push(approval);
        return approval;
    }
    updateFinanceApprovalStatus(id, status) {
        const approval = this.financeApprovals.find((item) => item.id === id);
        if (!approval) {
            throw new common_1.NotFoundException(`Finance approval ${id} was not found`);
        }
        approval.status = status;
        return approval;
    }
    listUploadedDocuments() {
        return this.uploadedDocuments;
    }
    createUploadedDocument(input) {
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
    listContractTemplates() {
        return this.contractTemplates;
    }
    createContractTemplate(input) {
        const template = {
            ...input,
            id: this.nextId('template'),
            updatedAt: new Date().toISOString(),
        };
        this.contractTemplates.push(template);
        return template;
    }
    listGeneratedContractPdfs() {
        return this.generatedContractPdfs;
    }
    generateContractPdf(input) {
        const pdf = {
            ...input,
            id: this.nextId('contract_pdf'),
            generatedAt: new Date().toISOString(),
        };
        this.generatedContractPdfs.push(pdf);
        return pdf;
    }
    listLegalContractApprovals() {
        return this.legalContractApprovals;
    }
    createLegalContractApproval(input) {
        const approval = {
            ...input,
            id: this.nextId('contract_approval'),
            submittedAt: new Date().toISOString(),
        };
        this.legalContractApprovals.push(approval);
        return approval;
    }
    updateLegalContractApprovalStatus(id, status) {
        const approval = this.legalContractApprovals.find((item) => item.id === id);
        if (!approval) {
            throw new common_1.NotFoundException(`Legal approval ${id} was not found`);
        }
        approval.status = status;
        return approval;
    }
    listSignedContracts() {
        return this.signedContracts;
    }
    createSignedContract(input) {
        const contract = {
            ...input,
            id: this.nextId('signed_contract'),
        };
        this.signedContracts.push(contract);
        return contract;
    }
    listNotificationMessages(channel) {
        return this.notificationMessages.filter((message) => {
            return ((!channel || message.channel === channel));
        });
    }
    createNotificationMessage(input) {
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
    listOverduePaymentAlerts() {
        return this.overduePaymentAlerts;
    }
    createOverduePaymentAlert(input) {
        const alert = {
            ...input,
            id: this.nextId('overdue'),
        };
        this.overduePaymentAlerts.push(alert);
        return alert;
    }
    listFollowUpReminders() {
        return this.followUpReminders;
    }
    createFollowUpReminder(input) {
        const reminder = {
            ...input,
            id: this.nextId('followup'),
        };
        this.followUpReminders.push(reminder);
        return reminder;
    }
    getReportsCatalog() {
        return this.reportCatalog;
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
    listSubscriptionPlans() {
        return this.subscriptionPlans;
    }
    listFeatureLimits() {
        return this.featureLimits;
    }
    listBrandingSettings() {
        return this.brandingSettings;
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
    publishBrandingSettings() {
        for (const setting of this.brandingSettings) {
            setting.status = 'live';
        }
        return this.brandingSettings;
    }
    listTenantBillingItems() {
        return this.tenantBillingItems;
    }
    listTenantDomains() {
        return this.tenantDomains;
    }
    createTenantDomain(input) {
        const domain = {
            ...input,
            id: this.nextId('domain'),
            status: 'pending_dns',
            ssl: 'pending',
            target: 'tenant.betflow.app',
        };
        this.tenantDomains.push(domain);
        return domain;
    }
    deleteTenantDomain(id) {
        const idx = this.tenantDomains.findIndex((item) => item.id === id);
        if (idx !== -1) {
            this.tenantDomains.splice(idx, 1);
        }
        return { success: true };
    }
    listFeatureFlags() {
        return this.featureFlags;
    }
    toggleFeatureFlag(key, enabled) {
        const flag = this.featureFlags.find((item) => item.key === key);
        if (!flag) {
            throw new common_1.NotFoundException(`Feature flag ${key} was not found`);
        }
        flag.enabled = enabled;
        return flag;
    }
    listOnboardingSteps() {
        return this.onboardingSteps;
    }
    updateOnboardingStep(stepName, status) {
        const step = this.onboardingSteps.find((item) => item.step === stepName);
        if (!step) {
            throw new common_1.NotFoundException(`Onboarding step ${stepName} was not found`);
        }
        step.status = status;
        return step;
    }
    listExcelImportTemplates() {
        return this.excelImportTemplates;
    }
    getTrialPeriod() {
        return this.trialPeriod;
    }
    getBillingAccount() {
        return this.billingAccount;
    }
    updateBillingAccount(input) {
        Object.assign(this.billingAccount, input);
        return this.billingAccount;
    }
    listDataTransferJobs() {
        return this.dataTransferJobs;
    }
    createDataTransferJob(input) {
        const job = {
            ...input,
            id: this.nextId(input.type),
            requestedAt: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            status: 'ready',
        };
        this.dataTransferJobs.unshift(job);
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