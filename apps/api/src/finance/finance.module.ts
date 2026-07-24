import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [PaymentsModule, ContractsModule],
  exports: [PaymentsModule, ContractsModule],
})
export class FinanceModule {}
