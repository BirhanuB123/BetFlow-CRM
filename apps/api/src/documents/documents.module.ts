import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DocumentStorageService } from './document-storage.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
