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
    this.logger.log('Running automated reservation expiration check...');

    try {
      const expiredCount =
        await this.reservationsService.processExpiredReservations();
      if (expiredCount > 0) {
        this.logger.log(
          `Successfully expired ${expiredCount} overdue reservation(s) and released unit(s).`,
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
