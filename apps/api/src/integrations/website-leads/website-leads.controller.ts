import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { WebsiteLeadCaptureDto } from './website-leads.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WebsiteLeadsService } from './website-leads.service';

@Controller('enterprise/website-leads')
export class WebsiteLeadsController {
  constructor(private readonly service: WebsiteLeadsService) {}

  /**
   * PUBLIC — called by external website forms.
   * Body is typed as Record to avoid isolatedModules + emitDecoratorMetadata issues
   * with imported interface types in decorated signatures.
   */
  @Post('capture')
  @HttpCode(HttpStatus.CREATED)
  capture(@Body() body: Record<string, string>) {
    if (!body?.firstName?.trim() || !body?.lastName?.trim()) {
      throw new BadRequestException('firstName and lastName are required');
    }
    return this.service.capture(body as unknown as WebsiteLeadCaptureDto);
  }

  /** PROTECTED — internal dashboard stats */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.service.stats();
  }
}
