import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
