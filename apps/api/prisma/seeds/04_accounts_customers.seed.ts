import type { PrismaClient } from '@prisma/client';

export async function seedAccountsAndCustomers(
  prisma: PrismaClient,
  users: { owner: { id: string }; agent: { id: string } },
) {
  const accountsData = [
    {
      id: 'account_001',
      name: 'Horizon Developers PLC',
      accountType: 'DEVELOPER',
      industry: 'Real Estate Development',
      rating: 'HOT',
      phone: '+251 11 551 2345',
      email: 'info@horizondevelopers.et',
      website: 'https://horizondevelopers.et',
      billingCity: 'Addis Ababa',
      billingState: 'Addis Ababa',
      billingCountry: 'Ethiopia',
      annualRevenue: '85000000.00',
      employees: 120,
      description:
        'Mid-to-high rise residential developer active in Bole and CMC corridors.',
      ownerId: users.owner.id,
    },
    {
      id: 'account_002',
      name: 'Abyssinia Capital Group',
      accountType: 'INVESTOR',
      industry: 'Investment',
      rating: 'WARM',
      phone: '+251 11 662 8800',
      email: 'deals@abyssiniacapital.com',
      website: 'https://abyssiniacapital.com',
      billingCity: 'Addis Ababa',
      billingState: 'Addis Ababa',
      billingCountry: 'Ethiopia',
      annualRevenue: '210000000.00',
      employees: 45,
      description:
        'Institutional buyer of residential and mixed-use inventory.',
      ownerId: users.agent.id,
    },
    {
      id: 'account_003',
      name: 'Sheger Realty Partners',
      accountType: 'PARTNER',
      industry: 'Real Estate Brokerage',
      rating: 'HOT',
      phone: '+251 91 122 3344',
      email: 'partners@shegerrealty.et',
      website: 'https://shegerrealty.et',
      billingCity: 'Addis Ababa',
      billingState: 'Addis Ababa',
      billingCountry: 'Ethiopia',
      annualRevenue: '12000000.00',
      employees: 28,
      description: 'Brokerage partner for unit sales and channel referrals.',
      ownerId: users.agent.id,
    },
    {
      id: 'account_004',
      name: 'Blue Nile Holdings',
      accountType: 'CUSTOMER',
      industry: 'Corporate',
      rating: 'COLD',
      phone: '+251 11 416 0900',
      email: 'procurement@bluenileholdings.et',
      website: null,
      billingCity: 'Bahir Dar',
      billingState: 'Amhara',
      billingCountry: 'Ethiopia',
      annualRevenue: '34000000.00',
      employees: 60,
      description: 'Corporate account evaluating bulk unit acquisition.',
      ownerId: users.owner.id,
    },
  ];

  for (const account of accountsData) {
    await prisma.account.upsert({
      where: { id: account.id },
      update: {
        name: account.name,
        accountType: account.accountType,
        industry: account.industry,
        rating: account.rating,
        phone: account.phone,
        email: account.email,
        website: account.website || null,
        billingCity: account.billingCity,
        billingState: account.billingState,
        billingCountry: account.billingCountry,
        annualRevenue: account.annualRevenue,
        employees: account.employees,
        description: account.description,
        ownerId: account.ownerId,
      },
      create: {
        id: account.id,
        name: account.name,
        accountType: account.accountType,
        industry: account.industry,
        rating: account.rating,
        phone: account.phone,
        email: account.email,
        website: account.website || null,
        billingStreet: 'Bole Road',
        billingCity: account.billingCity,
        billingState: account.billingState,
        billingCountry: account.billingCountry,
        annualRevenue: account.annualRevenue,
        employees: account.employees,
        description: account.description,
        ownerId: account.ownerId,
      },
    });
  }

  const customer = await prisma.customer.upsert({
    where: { id: 'customer_001' },
    update: {
      accountId: 'account_001',
      firstName: 'Nadia',
      lastName: 'Rahman',
      email: 'nadia.rahman@example.com',
      phone: '+251 91 100 0101',
      title: 'Procurement Lead',
    },
    create: {
      id: 'customer_001',
      accountId: 'account_001',
      firstName: 'Nadia',
      lastName: 'Rahman',
      email: 'nadia.rahman@example.com',
      phone: '+251 91 100 0101',
      title: 'Procurement Lead',
    },
  });

  const secondCustomer = await prisma.customer.upsert({
    where: { id: 'customer_002' },
    update: {
      accountId: 'account_002',
      firstName: 'Victor',
      lastName: 'Chen',
      email: 'victor.chen@example.com',
      phone: '+251 91 100 0102',
      title: 'Investment Director',
    },
    create: {
      id: 'customer_002',
      accountId: 'account_002',
      firstName: 'Victor',
      lastName: 'Chen',
      email: 'victor.chen@example.com',
      phone: '+251 91 100 0102',
      title: 'Investment Director',
    },
  });

  return { customer, secondCustomer };
}
