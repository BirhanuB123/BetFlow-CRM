import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
