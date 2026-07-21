import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentPlanService } from './payment-plan.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentPlanService],
  exports: [PaymentsService, PaymentPlanService],
})
export class PaymentsModule {}
