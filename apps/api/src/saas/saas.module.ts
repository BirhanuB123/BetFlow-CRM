import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { SaasController } from './saas.controller';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SaasController, TenantsController],
})
export class SaasModule {}
