import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type { UploadedDocument } from '../database/in-memory.service';

type CreateUploadedDocumentBody = Omit<UploadedDocument, 'id' | 'uploadedAt'>;

@Controller('documents')
export class DocumentsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listUploadedDocuments(tenantId);
  }

  @Post('uploads')
  upload(@Body() body: CreateUploadedDocumentBody) {
    return this.store.createUploadedDocument(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: UploadedDocument['status'],
  ) {
    return this.store.updateUploadedDocumentStatus(id, status);
  }
}
