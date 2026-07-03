import { Controller, Get } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly store: InMemoryService) {}

  @Get('catalog')
  catalog() {
    return this.store.getReportsCatalog();
  }

  @Get('sales')
  salesDashboard() {
    return this.store.getSalesDashboardReport();
  }

  @Get('agents')
  agentPerformance() {
    return this.store.getAgentPerformanceReport();
  }

  @Get('revenue')
  revenue() {
    return this.store.getRevenueReport();
  }

  @Get('inventory')
  inventory() {
    return this.store.getInventoryReport();
  }

  @Get('conversion')
  conversion() {
    return this.store.getConversionReport();
  }

  @Get('payment-aging')
  paymentAging() {
    return this.store.getPaymentAgingReport();
  }
}
