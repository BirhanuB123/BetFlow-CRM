import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ForecastingCronService {
  private readonly logger = new Logger(ForecastingCronService.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyForecastSnapshot() {
    this.logger.log('Starting daily revenue forecast calculation...');

    try {
      const forecast = await this.reportsService.forecastingReport();
      const salesDash = await this.reportsService.salesDashboard();

      // Log the forecast run to the audit log or create a notification
      // (For enterprise, you'd save this to a snapshot table, but for now we log it)
      this.logger.log(
        `Forecast complete: Weighted Pipeline ${forecast.totalWeightedPipeline}, Sales Velocity: ${salesDash.salesVelocity}`,
      );

      // We can also create a notification for admin users
      const admins = await this.prisma.user.findMany({
        where: { roles: { some: { role: { name: 'Admin' } } } },
      });

      if (admins.length > 0) {
        await this.prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'Daily Forecast Ready',
            message: `Pipeline Weighted Value: $${forecast.totalWeightedPipeline.toLocaleString()}. Sales Velocity: $${salesDash.salesVelocity}/day`,
          })),
        });
      }
    } catch (error) {
      this.logger.error('Failed to generate daily forecast snapshot', error);
    }
  }
}
