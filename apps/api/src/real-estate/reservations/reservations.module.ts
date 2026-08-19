import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { UnitsModule } from '../units/units.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationsCronService } from './reservations-cron.service';

@Module({
  imports: [DatabaseModule, AuthModule, IntegrationsModule, UnitsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsCronService],
})
export class ReservationsModule {}
