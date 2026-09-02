import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../database/prisma.service';

@Controller('r')
export class LinkTrackingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async trackAndRedirect(@Param('id') id: string, @Res() res: Response) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      const fallbackUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(302, fallbackUrl);
    }

    // Increment click counter
    await this.prisma.campaign.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    const destination =
      campaign.targetUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

    return res.redirect(302, destination);
  }
}
