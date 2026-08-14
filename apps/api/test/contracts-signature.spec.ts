import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from '../src/finance/contracts/contracts.service';
import { PdfGeneratorService } from '../src/finance/contracts/pdf-generator.service';
import { DocumentStorageService } from '../src/platform/documents/document-storage.service';
import { PrismaService } from '../src/database/prisma.service';

describe('ContractsService — E-Signature & Audit Hash', () => {
  let service: ContractsService;
  let pdfGenerator: PdfGeneratorService;
  let prisma: any;

  const mockContractId = 'contract-99';
  const mockUnitId = 'unit-77';

  beforeEach(async () => {
    prisma = {
      contract: {
        findUnique: jest.fn().mockResolvedValue({
          id: mockContractId,
          contractNumber: 'ET-CNT-2026-99',
          unitId: mockUnitId,
          status: 'ACTIVE',
        }),
        update: jest.fn().mockResolvedValue({ id: mockContractId, status: 'SIGNED' }),
      },
      signatureAudit: {
        create: jest.fn().mockImplementation(async ({ data }: any) => ({
          id: 'sig-audit-1',
          ...data,
          signedAt: new Date(),
        })),
        findMany: jest.fn().mockResolvedValue([
          { signerRole: 'BUYER' },
          { signerRole: 'SELLER_REP' },
        ]),
      },
      unit: {
        update: jest.fn().mockResolvedValue({ id: mockUnitId, status: 'SOLD' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        PdfGeneratorService,
        { provide: DocumentStorageService, useValue: { save: jest.fn() } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    pdfGenerator = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should sign contract, compute SHA-256 verification hash, and lock unit status to SOLD', async () => {
    const signatureInput = {
      signerName: 'Abebe Bikila',
      signerEmail: 'abebe@example.et',
      signerRole: 'BUYER' as const,
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    const reqMeta = {
      ipAddress: '197.156.64.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    const result = await service.signContract(mockContractId, signatureInput, reqMeta);

    expect(result).toBeDefined();
    expect(result.signerName).toBe('Abebe Bikila');
    expect(result.verificationHash).toBeDefined();
    expect(typeof result.verificationHash).toBe('string');
    expect(result.verificationHash.length).toBe(64); // SHA-256 hex string output length

    // Assert Contract status updated to SIGNED
    expect(prisma.contract.update).toHaveBeenCalledWith({
      where: { id: mockContractId },
      data: { status: 'SIGNED' },
    });

    // Assert Unit status updated to SOLD
    expect(prisma.unit.update).toHaveBeenCalledWith({
      where: { id: mockUnitId },
      data: { status: 'SOLD' },
    });
  });

  it('should generate consistent SHA-256 audit hashes for identical signature payloads', () => {
    const hash1 = pdfGenerator.computeSignatureHash(
      mockContractId,
      'Abebe Bikila',
      '2026-08-07T10:00:00.000Z',
      '197.156.64.1',
      'data:image/png;base64,abc123sig',
    );

    const hash2 = pdfGenerator.computeSignatureHash(
      mockContractId,
      'Abebe Bikila',
      '2026-08-07T10:00:00.000Z',
      '197.156.64.1',
      'data:image/png;base64,abc123sig',
    );

    expect(hash1).toEqual(hash2);
    expect(hash1.length).toBe(64);
  });
});
