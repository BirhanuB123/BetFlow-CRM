import { Module } from '@nestjs/common';
import { JwtService } from '../../core/auth/jwt.service';
import { PasswordService } from '../../core/auth/password.service';
import { DatabaseModule } from '../../database/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService, PasswordService],
})
export class UsersModule {}
