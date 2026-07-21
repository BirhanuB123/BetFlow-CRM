import { Module } from '@nestjs/common';
import { JwtService } from '../../core/auth/jwt.service';
import { DatabaseModule } from '../../database/database.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController],
  providers: [RolesService, JwtService],
})
export class RolesModule {}
