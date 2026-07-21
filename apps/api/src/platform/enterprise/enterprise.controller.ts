import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

const enterpriseCapabilities = {
  'website-leads': {
    name: 'Website lead capture integration',
    status: 'configured',
    endpoints: ['POST /enterprise/website-leads/capture'],
  },
  'social-leads': {
    name: 'Facebook and Instagram lead import',
    status: 'configured',
    endpoints: ['POST /enterprise/social-leads/meta-webhook'],
  },
  'follow-up-automation': {
    name: 'WhatsApp and SMS follow-up automation',
    status: 'configured',
    endpoints: ['POST /enterprise/follow-up-automation/sequences'],
  },
  'email-campaigns': {
    name: 'Email campaign automation',
    status: 'configured',
    endpoints: ['POST /enterprise/email-campaigns'],
  },
  'customer-portal': {
    name: 'Customer portal',
    status: 'configured',
    endpoints: [
      'POST /portal/auth/login',
      'GET /portal/me',
      'GET /portal/payment-schedules',
      'GET /portal/contracts',
      'GET /portal/documents',
      'GET /portal/invoices',
    ],
  },
  'mobile-pwa': {
    name: 'Agent mobile app and PWA',
    status: 'planned',
    endpoints: ['GET /mobile/sync'],
  },
  'sales-forecasting': {
    name: 'Advanced sales forecasting',
    status: 'configured',
    endpoints: ['GET /enterprise/sales-forecasting/run'],
  },
  'contract-builder': {
    name: 'Contract template builder',
    status: 'configured',
    endpoints: ['POST /enterprise/contract-builder/templates'],
  },
  'approval-workflows': {
    name: 'Approval workflows',
    status: 'configured',
    endpoints: ['POST /enterprise/approval-workflows'],
  },
  'api-marketplace': {
    name: 'API and webhook marketplace',
    status: 'configured',
    endpoints: ['GET /enterprise/api-marketplace/apps'],
  },
};

@Controller('enterprise')
export class EnterpriseController {
  @Get()
  list() {
    return Object.entries(enterpriseCapabilities).map(([key, capability]) => ({
      key,
      ...capability,
    }));
  }

  @Get(':key')
  get(@Param('key') key: keyof typeof enterpriseCapabilities) {
    const capability = enterpriseCapabilities[key];

    if (!capability) {
      throw new NotFoundException(`Enterprise capability ${key} was not found`);
    }

    return {
      key,
      ...capability,
    };
  }
}
