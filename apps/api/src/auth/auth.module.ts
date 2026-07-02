import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantsModule } from '../tenants/tenants.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';

@Module({
  imports: [DatabaseModule, TenantsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, PasswordService],
  exports: [AuthService, JwtService, PasswordService],
})
export class AuthModule {}
