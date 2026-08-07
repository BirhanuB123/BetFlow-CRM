import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WebsiteLeadCaptureDto } from './website-leads.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { WebsiteLeadsService } from './website-leads.service';

@Controller('enterprise/website-leads')
export class WebsiteLeadsController {
  constructor(private readonly service: WebsiteLeadsService) {}

  /**
   * PUBLIC — called by external website forms.
   * Rate limited to 10 submissions per minute per IP.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('capture')
  @HttpCode(HttpStatus.CREATED)
  capture(@Body() dto: WebsiteLeadCaptureDto) {
    return this.service.capture(dto);
  }

  /** PROTECTED — internal dashboard stats */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.service.stats();
  }
}

