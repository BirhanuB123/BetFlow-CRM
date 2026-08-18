import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { DocumentStorageService } from './document-storage.service';
import { DocumentsCronService } from './documents-cron.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuthModule, DatabaseModule, IntegrationsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentStorageService, DocumentsCronService],
  exports: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
