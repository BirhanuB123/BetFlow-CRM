import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContractsController],
})
export class ContractsModule {}
