import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
