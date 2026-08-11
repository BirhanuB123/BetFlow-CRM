import { AiScoringService } from './ai-scoring.service';

describe('AiScoringService', () => {
  let service: AiScoringService;

  beforeEach(() => {
    service = new AiScoringService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should score a high-intent referral lead as HOT (score >= 75)', () => {
    const result = service.scoreLead({
      id: 'lead-1',
      firstName: 'Abebe',
      lastName: 'Bikila',
      email: 'abebe@example.com',
      phone: '+251911223344',
      company: 'Addis Realty Group',
      sourceName: 'Referral',
      status: 'QUALIFIED',
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.intent).toBe('HOT');
    expect(result.recommendedPriority).toBe('High');
    expect(result.factors).toContain('High-conversion referral source (+30)');
    expect(result.factors).toContain('Complete dual-channel contact info (+20)');
  });

  it('should score a lead with minimal data as COLD (score < 40)', () => {
    const result = service.scoreLead({
      id: 'lead-2',
      firstName: 'Test',
      lastName: 'User',
      status: 'NEW',
    });

    expect(result.score).toBeLessThan(40);
    expect(result.intent).toBe('COLD');
    expect(result.recommendedPriority).toBe('Low');
  });
});
