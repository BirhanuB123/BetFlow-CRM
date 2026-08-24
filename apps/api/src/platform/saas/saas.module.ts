import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../core/auth/auth.module';
import { SaasController } from './saas.controller';
import { TenantsController } from './tenants.controller';
import { SaasService } from './saas.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SaasController, TenantsController],
  providers: [SaasService],
  exports: [SaasService],
})
export class SaasModule {}
