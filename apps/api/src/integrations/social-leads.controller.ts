import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
  Query,
  Headers,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { IntegrationsService } from './integrations.service';

@Controller('enterprise/social-leads')
export class SocialLeadsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('stats')
  async getStats() {
    return this.integrationsService.getSocialLeadsStats();
  }

  @Get('meta-webhook')
  verifyMetaWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken =
      process.env.META_VERIFY_TOKEN || 'your_random_secret_token';

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(HttpStatus.OK).send(challenge);
    }

    return res.status(HttpStatus.FORBIDDEN).send();
  }

  @Post('meta-webhook')
  async receiveMetaWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string,
    @Res() res: Response,
  ) {
    const payloadString = req.rawBody
      ? req.rawBody.toString()
      : JSON.stringify(req.body);
    const isValid = this.integrationsService.validateMetaSignature(
      payloadString,
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const body = req.body;
    if (body.object === 'page') {
      if (body.entry) {
        for (const entry of body.entry) {
          await this.integrationsService.processMetaLead(entry);
        }
      }
      return res.status(HttpStatus.OK).send('EVENT_RECEIVED');
    }

    return res.status(HttpStatus.NOT_FOUND).send();
  }
}
