import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsService } from './reservations.service';

@Injectable()
export class ReservationsCronService {
  private readonly logger = new Logger(ReservationsCronService.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Periodically check for and expire overdue reservations.
   * Runs every 15 minutes by default.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredReservations() {
    this.logger.log(
      'Running automated reservation expiration & SMS warning check...',
    );

    try {
      // 1. Process Day 10 and Day 13 SMS Expiry Warnings via Ethio Telecom / AfroMessage
      const warnings =
        await this.reservationsService.processMultiStageExpiryWarnings();
      if (warnings.day10WarningsSent > 0 || warnings.day13WarningsSent > 0) {
        this.logger.log(
          `Dispatched ${warnings.day10WarningsSent} Day-10 warning(s) and ${warnings.day13WarningsSent} Day-13 urgent final SMS warning(s).`,
        );
      }

      // 2. Process Day 14 Auto-Expiries and release units back to AVAILABLE
      const expiredCount =
        await this.reservationsService.processExpiredReservations();
      if (expiredCount > 0) {
        this.logger.log(
          `Successfully expired ${expiredCount} overdue reservation(s) and released unit(s) back to AVAILABLE.`,
        );
      } else {
        this.logger.log('No overdue reservations found.');
      }
    } catch (error) {
      this.logger.error(
        'Error while executing reservation expiration task:',
        error,
      );
    }
  }
}
