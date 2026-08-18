import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ContractsService } from './contracts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { ContractBuilderService } from './contract-builder.service';
import type {
  GenerateContractInput,
  ContractSignatureInput,
} from '@betflow/shared';
import type {
  CreateContractInput,
  UpdateContractInput,
} from './contracts.types';

@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contracts: ContractsService,
    private readonly builderService: ContractBuilderService,
  ) {}

  @Post('generate')
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GenerateContractInput,
  ) {
    return this.builderService.generateContract(user.id, body);
  }

  @Get('approvals')
  listApprovals() {
    return this.builderService.listPendingApprovals();
  }

  @Post('approvals/:id/review')
  reviewApproval(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' },
  ) {
    return this.builderService.reviewApproval(user.id, id, body.action);
  }

  @Get('verify/:id')
  verify(@Param('id') id: string) {
    return this.contracts.verifyContract(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.contracts.generatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Contract_${id}.pdf"`,
    );
    res.send(buffer);
  }

  @Post(':id/signatures')
  sign(
    @Param('id') id: string,
    @Body() body: ContractSignatureInput,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    return this.contracts.signContract(id, body, { ipAddress, userAgent });
  }

  @Get(':id/signatures')
  getSignatures(@Param('id') id: string) {
    return this.contracts.getSignatures(id);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.contracts.list();
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.contracts.get(id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateContractInput,
  ) {
    return this.contracts.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateContractInput,
  ) {
    return this.contracts.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.contracts.remove(user.id, id);
  }
}
