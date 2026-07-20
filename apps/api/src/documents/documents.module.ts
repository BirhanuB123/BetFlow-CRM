import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { DocumentStorageService } from './document-storage.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
