import { InMemoryService } from '../database/in-memory.service';
export declare class ReportsController {
    private readonly store;
    constructor(store: InMemoryService);
    catalog(): import("../database/in-memory.service").ReportCatalogEntry[];
    salesDashboard(): import("../database/in-memory.service").ReportMetric[];
    agentPerformance(): import("../database/in-memory.service").AgentPerformanceReport[];
    revenue(): import("../database/in-memory.service").RevenueReportRow[];
    inventory(): import("../database/in-memory.service").InventoryReportRow[];
    conversion(): import("../database/in-memory.service").ConversionReportRow[];
    paymentAging(): import("../database/in-memory.service").PaymentAgingReportRow[];
}
