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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { type IncomingDocumentFile } from './document-storage.service';
import {
  type CreateDocumentBody,
  type DocumentFilters,
  DocumentsService,
  type ReviewDocumentBody,
} from './documents.service';

import { DocumentsCronService } from './documents-cron.service';

type ResponseHeaders = { setHeader(name: string, value: string): void };

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('documents.manage')
export class DocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly cron: DocumentsCronService,
  ) {}

  @Get('kyc-status/:customerId')
  getKycStatus(@Param('customerId') customerId: string) {
    return this.documents.getKycStatus(customerId);
  }

  @Get('contract-status/:contractId')
  getContractStatus(@Param('contractId') contractId: string) {
    return this.documents.getContractDocumentStatus(contractId);
  }

  @Post('check-expiries')
  checkExpiries() {
    return this.cron.runAudit();
  }

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filters: DocumentFilters,
  ) {
    return this.documents.list(filters);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }),
  )
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
    const { document, stream } = await this.documents.download(id);
    response.setHeader(
      'Content-Type',
      document.mimeType || 'application/octet-stream',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${this.safeFileName(document.name)}"`,
    );
    return new StreamableFile(stream);
  }

  @Patch(':id/review')
  @Roles('Owner', 'Admin', 'Finance')
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: ReviewDocumentBody,
  ) {
    return this.documents.review(user, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.documents.remove(user, id);
  }

  private safeFileName(name: string) {
    return name.replace(/[\\"\r\n]/g, '_');
  }
}
