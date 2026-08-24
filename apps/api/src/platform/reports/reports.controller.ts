import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { InMemoryService } from '../../database/in-memory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequirePermission } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('reports.view')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly store: InMemoryService,
  ) {}

  // Still served from in-memory (static catalog metadata is fine)
  @Get('catalog')
  catalog() {
    return this.store.getReportsCatalog();
  }

  @Get('sales')
  salesDashboard() {
    return this.reports.salesDashboard();
  }

  @Get('agents')
  agentPerformance() {
    return this.reports.agentPerformance();
  }

  @Get('revenue')
  revenue() {
    return this.reports.revenueReport();
  }

  @Get('inventory')
  inventory() {
    return this.reports.inventoryReport();
  }

  @Get('conversion')
  conversion() {
    return this.reports.conversionFunnel();
  }

  @Get('payment-aging')
  paymentAging() {
    return this.reports.paymentAging();
  }

  @Get('forecasting')
  forecasting() {
    return this.reports.forecastingReport();
  }
}
