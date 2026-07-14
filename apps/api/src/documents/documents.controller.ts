import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { type IncomingDocumentFile } from './document-storage.service';
import {
  type CreateDocumentBody,
  type DocumentFilters,
  DocumentsService,
  type ReviewDocumentBody,
} from './documents.service';

type ResponseHeaders = { setHeader(name: string, value: string): void };

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() filters: DocumentFilters) {
    return this.documents.list(user.tenantId, filters);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: IncomingDocumentFile,
    @Body() body: CreateDocumentBody,
  ) {
    return this.documents.upload(user, body, file);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: ResponseHeaders,
  ) {
    const { document, stream } = await this.documents.download(user.tenantId, id);
    response.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    response.setHeader('Content-Disposition', `attachment; filename="${this.safeFileName(document.name)}"`);
    return new StreamableFile(stream);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('Owner', 'Admin')
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: ReviewDocumentBody,
  ) {
    return this.documents.review(user, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.remove(user, id);
  }

  private safeFileName(name: string) {
    return name.replace(/[\\"\r\n]/g, '_');
  }
}
