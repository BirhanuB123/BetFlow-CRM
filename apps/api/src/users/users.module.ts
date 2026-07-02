import { Module } from '@nestjs/common';
import { JwtService } from '../auth/jwt.service';
import { PasswordService } from '../auth/password.service';
import { DatabaseModule } from '../database/database.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, TenantsModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService, PasswordService],
})
export class UsersModule {}
