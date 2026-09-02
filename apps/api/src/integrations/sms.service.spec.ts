import { SmsService } from './sms.service';

describe('SmsService - Send Path, Gateways & Fallbacks', () => {
  let service: SmsService;
  let prisma: any;
  let inMemory: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AFROMESSAGE_API_KEY;
    delete process.env.AFRO_TOKEN;
    delete process.env.AFRO_SENDER;
    delete process.env.AFRO_IDENTIFIER;
    delete process.env.ETHIO_SMS_API_URL;
    delete process.env.ETHIO_SMS_TOKEN;
    delete process.env.ETHIO_SMS_SHORTCODE;

    prisma = {
      smsOutbox: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'outbox-101',
            recipientName: data.recipientName,
            phone: data.phone,
            body: data.body,
            triggerType: data.triggerType,
            status: data.status,
            costEthioBirr: data.costEthioBirr,
            gatewayUsed: data.gatewayUsed,
            attemptsCount: data.attemptsCount,
            encoding: data.encoding,
            segmentCount: data.segmentCount,
            sentAt: data.sentAt || new Date(),
            deliveredAt: data.deliveredAt || null,
          }),
        ),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest
          .fn()
          .mockResolvedValue({ _sum: { costEthioBirr: 0, segmentCount: 0 } }),
      },
      lead: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      customer: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      project: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      contract: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    inMemory = {
      recordActivity: jest.fn(),
    };

    service = new SmsService(prisma, inMemory);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Phone Number Canonical Formatting', () => {
    it('should format local 09 / 07 numbers to canonical 2519... format', () => {
      expect(service.formatEthioPhone('0911234567')).toBe('251911234567');
      expect(service.formatEthioPhone('0712345678')).toBe('251712345678');
      expect(service.formatEthioPhone('+251 911 234 567')).toBe('251911234567');
      expect(service.formatEthioPhone('911234567')).toBe('251911234567');
    });
  });

  describe('1. Sandbox / Mock Mode Fallback (No API Keys)', () => {
    it('should route to Ethio Telecom Gateway Sandbox with DELIVERED status when no keys configured', async () => {
      const result = await service.sendSms({
        recipientName: 'Abebe Kebede',
        recipientPhone: '0911223344',
        body: 'Welcome to BetFlow Real Estate Stacking Elevation',
        triggerType: 'SITE_VISIT_REMINDER',
      });

      expect(result.status).toBe('DELIVERED');
      expect(result.gatewayUsed).toBe('Ethio Telecom Gateway Sandbox');
      expect(prisma.smsOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientName: 'Abebe Kebede',
            phone: '251911223344',
            status: 'DELIVERED',
            gatewayUsed: 'Ethio Telecom Gateway Sandbox',
          }),
        }),
      );
    });
  });

  describe('2. AfroMessage Live Gateway Send Path', () => {
    it('should successfully send via AfroMessage API and record status DELIVERED', async () => {
      process.env.AFROMESSAGE_API_KEY = 'test-afro-key-123';
      process.env.AFROMESSAGE_SENDER_ID = 'BetFlow';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          response: {
            message_id: 'afro-msg-9999',
            to: '251911223344',
          },
        }),
      });
      global.fetch = mockFetch as any;

      const result = await service.sendSms({
        recipientName: 'Sara Tesfaye',
        recipientPhone: '0911556677',
        body: 'ውድ ሳራ፣ የቤት ቁጥር B-402 መያዣ ጊዜው ሊያበቃ 3 ቀናት ቀርተዋል።',
        triggerType: 'HOLD_EXPIRY_ALERT',
      });

      expect(result.status).toBe('DELIVERED');
      expect(result.gatewayUsed).toContain('AfroMessage');
      expect(mockFetch).toHaveBeenCalled();

      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
      expect(calledUrl).toContain('afromessage.com');
      expect(calledOptions.headers.Authorization).toBe(
        'Bearer test-afro-key-123',
      );

      expect(prisma.smsOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '251911556677',
            status: 'DELIVERED',
          }),
        }),
      );
    });

    it('should mark status as FAILED when AfroMessage API returns an error and no failover is available', async () => {
      process.env.AFROMESSAGE_API_KEY = 'test-afro-key-invalid';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Unauthorized API key' }),
      });
      global.fetch = mockFetch as any;

      const result = await service.sendSms({
        recipientName: 'Dawit Yohannes',
        recipientPhone: '0911998877',
        body: 'Payment reminder for Unit 104',
        triggerType: 'PAYMENT_DUE_ALERT',
      });

      expect(result.status).toBe('FAILED');
      expect(mockFetch).toHaveBeenCalled();

      expect(prisma.smsOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '251911998877',
            status: 'FAILED',
          }),
        }),
      );
    });
  });

  describe('3. Dual-Gateway Automatic Failover (AfroMessage -> Ethio Telecom)', () => {
    it('should automatically fail over to Ethio Telecom when AfroMessage returns an HTTP error', async () => {
      process.env.AFROMESSAGE_API_KEY = 'test-afro-key';
      process.env.ETHIO_SMS_API_URL = 'https://api.ethiotelecom.et/sms/v1/send';
      process.env.ETHIO_SMS_TOKEN = 'ethio-token-xyz';
      process.env.ETHIO_SMS_SHORTCODE = '8844';

      const mockFetch = jest.fn().mockImplementation(async (url: string) => {
        if (url.includes('afromessage.com')) {
          return {
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => ({ error: 'Sender ID not approved' }),
          };
        }
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ success: true }),
        };
      });

      global.fetch = mockFetch as any;

      const result = await service.sendSms({
        recipientName: 'Mulugeta Bekele',
        recipientPhone: '0922334455',
        body: 'Construction Milestone Phase 3 Concrete Pouring Complete',
        triggerType: 'MANUAL_BROADCAST',
      });

      expect(result.status).toBe('DELIVERED');
      expect(result.gatewayUsed).toBe('Ethio Telecom Direct Shortcode (8844)');
      expect(mockFetch).toHaveBeenCalled();

      expect(prisma.smsOutbox.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '251922334455',
            status: 'DELIVERED',
            gatewayUsed: 'Ethio Telecom Direct Shortcode (8844)',
          }),
        }),
      );
    });
  });

  describe('4. Delivery Callback Webhook Handling', () => {
    it('should update outbox log to DELIVERED when receiving delivery callback with success', async () => {
      const callbackResult = await service.handleAfroMessageCallback({
        message_id: 'outbox-101',
        to: '251911223344',
        status: 'DELIVERED',
      });

      expect(callbackResult.acknowledged).toBe(true);
      expect(callbackResult.updatedStatus).toBe('DELIVERED');
      expect(prisma.smsOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: 'outbox-101' },
        data: expect.objectContaining({
          status: 'DELIVERED',
        }),
      });
    });

    it('should update outbox log to FAILED when receiving rejection or failure callback', async () => {
      const callbackResult = await service.handleAfroMessageCallback({
        message_id: 'outbox-101',
        to: '251911223344',
        status: 'FAILED_INVALID_NUMBER',
      });

      expect(callbackResult.acknowledged).toBe(true);
      expect(callbackResult.updatedStatus).toBe('FAILED');
      expect(prisma.smsOutbox.updateMany).toHaveBeenCalledWith({
        where: { id: 'outbox-101' },
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      });
    });
  });
});
