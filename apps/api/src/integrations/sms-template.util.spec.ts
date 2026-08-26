import { interpolateTemplate } from './sms-template.util';

describe('interpolateTemplate', () => {
  it('replaces all present keys correctly', () => {
    const template =
      'Dear {clientName}, site visit for {projectName} is on {visitDate} at {visitTime}. Contact {agentName} ({agentPhone}).';
    const data = {
      clientName: 'Abebe Bikila',
      projectName: 'Bole Residential Tower',
      visitDate: '2026-08-30',
      visitTime: '2:30 PM',
      agentName: 'Maya Johnson',
      agentPhone: '0911223344',
    };

    const result = interpolateTemplate(template, data);
    expect(result.missing).toEqual([]);
    expect(result.body).toBe(
      'Dear Abebe Bikila, site visit for Bole Residential Tower is on 2026-08-30 at 2:30 PM. Contact Maya Johnson (0911223344).',
    );
  });

  it('collects missing keys and preserves placeholder in body', () => {
    const template =
      'Dear {clientName}, site visit for {projectName} is on {visitDate}. Contact {agentName} ({agentPhone}).';
    const data = {
      clientName: 'Abebe Bikila',
      projectName: 'Bole Residential Tower',
      // visitDate missing
      agentName: 'Maya Johnson',
      // agentPhone missing
    };

    const result = interpolateTemplate(template, data);
    expect(result.missing).toEqual(['visitDate', 'agentPhone']);
    expect(result.body).toBe(
      'Dear Abebe Bikila, site visit for Bole Residential Tower is on {visitDate}. Contact Maya Johnson ({agentPhone}).',
    );
  });

  it('handles empty template string', () => {
    const result = interpolateTemplate('', { clientName: 'Test' });
    expect(result).toEqual({ body: '', missing: [] });
  });

  it('replaces construction update placeholders correctly', () => {
    const rawTemplate =
      'BetFlow Construction Update: Works on {projectName} have progressed to {stageName}.';
    const result = interpolateTemplate(rawTemplate, {
      projectName: 'Harbor Point Towers',
      stageName: 'STRUCTURE CONCRETE SLAB',
    });
    expect(result.missing).toEqual([]);
    expect(result.body).toBe(
      'BetFlow Construction Update: Works on Harbor Point Towers have progressed to STRUCTURE CONCRETE SLAB.',
    );
  });
});
