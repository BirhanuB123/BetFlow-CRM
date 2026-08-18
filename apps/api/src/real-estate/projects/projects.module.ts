import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [DatabaseModule, AuthModule, IntegrationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
