import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { MetaWebhookPayload } from './social-leads.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SocialLeadsService } from './social-leads.service';

@Controller('enterprise/social-leads')
export class SocialLeadsController {
  constructor(private readonly service: SocialLeadsService) {}

  /**
   * Meta webhook verification challenge (GET).
   * PUBLIC — Meta calls this to verify ownership of the callback URL.
   */
  @Get('meta-webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.service.verifyWebhook(mode, token, challenge);
  }

  /**
   * Meta webhook event receiver (POST).
   * PUBLIC — Meta posts lead events here.
   *
   * Both @Req and @Body are typed with built-in types (no external import in
   * the decorated signature) to satisfy isolatedModules + emitDecoratorMetadata.
   * The raw body buffer is accessed via a type cast for HMAC validation.
   */
  @Post('meta-webhook')
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Req() req: Record<string, unknown>,
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const rawBody = req.rawBody as Buffer | undefined;
    if (rawBody) {
      this.service.validateSignature(rawBody, signature);
    }

    return this.service.processWebhook(payload as unknown as MetaWebhookPayload);
  }

  /** PROTECTED — internal dashboard stats */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  stats() {
    return this.service.stats();
  }
}
