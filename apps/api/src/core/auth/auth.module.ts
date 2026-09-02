import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtService, PasswordService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
