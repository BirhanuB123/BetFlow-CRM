import { BadRequestException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { describe, beforeEach, it } from 'node:test';

describe('CampaignsService - Multi-Channel Campaigns & SMS Broadcasting', () => {
  let service: CampaignsService;
  let prisma: any;
  let smsService: any;

  beforeEach(() => {
    prisma = {
      campaign: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'camp-1',
            name: 'Launch Broadcast',
            type: 'TELEGRAM',
            status: 'SENT',
            recipientCount: 1500,
            clicks: 120,
            startDate: new Date('2026-08-01'),
          },
          {
            id: 'camp-2',
            name: 'SMS Flash Discount',
            type: 'SMS',
            status: 'SENT',
            recipientCount: 45,
            clicks: 0,
            startDate: new Date('2026-08-05'),
          },
        ]),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: data.id || 'camp-new',
            name: data.name,
            type: data.type,
            status: data.status,
            recipientCount: data.recipientCount,
            targetUrl: data.targetUrl,
            clicks: data.clicks,
            startDate: data.startDate,
          }),
        ),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    smsService = {
      getSmsContacts: jest.fn().mockResolvedValue([
        {
          id: 'lead-1',
          name: 'Abebe Bikila',
          phone: '251911223344',
          email: 'abebe@example.com',
          type: 'LEAD',
          segment: 'WARM_LEADS',
          details: 'Warm lead',
        },
        {
          id: 'cust-1',
          name: 'Saron Taddesse',
          phone: '251922334455',
          email: 'saron@example.com',
          type: 'CUSTOMER',
          segment: 'RESERVATION_CLIENTS',
          details: 'Customer',
        },
      ]),
      sendSms: jest.fn().mockResolvedValue({
        id: 'outbox-1',
        status: 'DELIVERED',
      }),
    };

    service = new CampaignsService(prisma, smsService);
  });

  describe('listCampaigns', () => {
    it('should list campaigns with proper segment formatting and connection indicators', async () => {
      const result = await service.listCampaigns();
      expect(result).toHaveLength(2);
      expect(result[0].channel).toBe('TELEGRAM');
      expect(result[0].recipients).toBe(1500);
      expect(result[1].channel).toBe('SMS');
      expect(result[1].recipients).toBe(45);
    });
  });

  describe('createCampaign - SMS Channel', () => {
    it('should successfully dispatch SMS broadcast to CRM contacts and record campaign as SENT', async () => {
      const result = await service.createCampaign('user-1', {
        title: 'Bole Tower VIP Invitation',
        channel: 'SMS',
        segment: 'All Contacts',
        message:
          'Dear {clientName}, you are invited to our luxury penthouse launch!',
      });

      expect(smsService.getSmsContacts).toHaveBeenCalled();
      expect(smsService.sendSms).toHaveBeenCalledTimes(2);
      expect(prisma.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Bole Tower VIP Invitation',
            type: 'SMS',
            status: 'SENT',
            recipientCount: 2,
          }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'sms_campaign.created',
          }),
        }),
      );
      expect(result.status).toBe('SENT');
      expect(result.recipients).toBe(2);
    });

    it('should filter contacts by segment when a specific segment is targeted', async () => {
      const result = await service.createCampaign('user-1', {
        title: 'Warm Leads Exclusive',
        channel: 'SMS',
        segment: 'WARM_LEADS',
        message: 'Exclusive 5% discount for warm leads: {clientName}',
      });

      expect(smsService.sendSms).toHaveBeenCalledTimes(1);
      expect(result.recipients).toBe(1);
    });
  });

  describe('createCampaign - Validation and Unsupported Channels', () => {
    it('should throw BadRequestException if title or message is missing', async () => {
      await expect(
        service.createCampaign('user-1', {
          title: '',
          channel: 'SMS',
          message: 'Hello',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createCampaign('user-1', {
          title: 'Test',
          channel: 'SMS',
          message: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unconnected FACEBOOK and WHATSAPP channels', async () => {
      await expect(
        service.createCampaign('user-1', {
          title: 'Meta Campaign',
          channel: 'FACEBOOK',
          message: 'Hello Facebook leads',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createCampaign('user-1', {
          title: 'WhatsApp Campaign',
          channel: 'WHATSAPP',
          message: 'Hello WhatsApp leads',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
