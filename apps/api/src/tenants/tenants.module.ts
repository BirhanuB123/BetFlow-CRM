import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantsController],
})
export class TenantsModule {}
