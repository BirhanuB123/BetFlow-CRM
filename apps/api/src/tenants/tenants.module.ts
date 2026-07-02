import { Module } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { JwtService } from '../auth/jwt.service';
import { DatabaseModule } from '../database/database.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantsController],
  providers: [TenantsService, JwtService, PasswordService],
  exports: [TenantsService],
})
export class TenantsModule {}
