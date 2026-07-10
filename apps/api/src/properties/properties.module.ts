import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
