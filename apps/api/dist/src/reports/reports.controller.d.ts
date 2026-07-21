import { ReportsService } from './reports.service';
import { InMemoryService } from '../database/in-memory.service';
export declare class ReportsController {
    private readonly reports;
    private readonly store;
    constructor(reports: ReportsService, store: InMemoryService);
    catalog(): import("../database/in-memory.service").ReportCatalogEntry[];
    salesDashboard(): Promise<{
        bookedRevenue: number;
        collectedPayments: number;
        outstanding: number;
        activeReservations: number;
        activeContracts: number;
        openLeads: number;
        metrics: {
            label: string;
            value: string;
            detail: string;
        }[];
    }>;
    agentPerformance(): Promise<{
        agentId: string;
        agent: string;
        leads: number;
        visits: number;
        reservations: number;
        revenue: string;
        conversion: string;
    }[]>;
    revenue(): Promise<{
        period: string;
        booked: string;
        collected: string;
        outstanding: string;
        forecast: string;
    }[]>;
    inventory(): import("../database/in-memory.service").InventoryReportRow[];
    conversion(): Promise<{
        stage: string;
        count: number;
        rate: string;
        dropOff: string;
    }[]>;
    paymentAging(): Promise<{
        bucket: string;
        invoices: number;
        amount: string;
        risk: string;
    }[]>;
}
