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
import type {
  ContractTemplate,
  GeneratedContractPdf,
  LegalContractApproval,
  SignedContract,
} from '../database/in-memory.service';

type CreateContractTemplateBody = Omit<ContractTemplate, 'id' | 'updatedAt'>;
type GenerateContractPdfBody = Omit<GeneratedContractPdf, 'id' | 'generatedAt'>;
type CreateLegalApprovalBody = Omit<
  LegalContractApproval,
  'id' | 'submittedAt'
>;
type CreateSignedContractBody = Omit<SignedContract, 'id'>;

@Controller('contracts')
export class ContractsController {
  constructor(private readonly store: InMemoryService) {}

  @Get('templates')
  listTemplates(@Query('tenantId') tenantId?: string) {
    return this.store.listContractTemplates(tenantId);
  }

  @Post('templates')
  createTemplate(@Body() body: CreateContractTemplateBody) {
    return this.store.createContractTemplate(body);
  }

  @Get('generated')
  listGenerated(@Query('tenantId') tenantId?: string) {
    return this.store.listGeneratedContractPdfs(tenantId);
  }

  @Post('generate')
  generatePdf(@Body() body: GenerateContractPdfBody) {
    return this.store.generateContractPdf(body);
  }

  @Get('approvals')
  listApprovals(@Query('tenantId') tenantId?: string) {
    return this.store.listLegalContractApprovals(tenantId);
  }

  @Post('approvals')
  createApproval(@Body() body: CreateLegalApprovalBody) {
    return this.store.createLegalContractApproval(body);
  }

  @Patch('approvals/:id/status')
  updateApprovalStatus(
    @Param('id') id: string,
    @Body('status') status: LegalContractApproval['status'],
    @Body('note') note?: string,
  ) {
    return this.store.updateLegalContractApprovalStatus(id, status, note);
  }

  @Get('signed')
  listSigned(@Query('tenantId') tenantId?: string) {
    return this.store.listSignedContracts(tenantId);
  }

  @Post('signed')
  createSigned(@Body() body: CreateSignedContractBody) {
    return this.store.createSignedContract(body);
  }
}
