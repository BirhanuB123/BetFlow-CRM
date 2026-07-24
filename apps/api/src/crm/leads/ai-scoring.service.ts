import { Injectable } from '@nestjs/common';
import type { AiLeadScore } from '@betflow/shared';

export type LeadScoringInput = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  sourceName?: string | null;
  createdAt?: Date | string;
};

@Injectable()
export class AiScoringService {
  /**
   * Evaluates a lead using BetFlow AI heuristic algorithms and returns
   * an intent score (0-100), key scoring factors, and recommended next action.
   */
  scoreLead(lead: LeadScoringInput): AiLeadScore {
    let score = 0;
    const factors: string[] = [];

    // 1. Source Weighting
    const source = (lead.sourceName || '').toLowerCase();
    if (source.includes('referral') || source.includes('direct')) {
      score += 30;
      factors.push('High-conversion referral source (+30)');
    } else if (source.includes('website') || source.includes('inbound')) {
      score += 20;
      factors.push('Direct website inbound lead (+20)');
    } else if (
      source.includes('meta') ||
      source.includes('facebook') ||
      source.includes('social')
    ) {
      score += 15;
      factors.push('Social media campaign lead (+15)');
    } else {
      score += 10;
      factors.push('Standard lead channel (+10)');
    }

    // 2. Data Completeness & Reachability
    if (lead.email && lead.phone) {
      score += 20;
      factors.push('Complete dual-channel contact info (+20)');
    } else if (lead.email || lead.phone) {
      score += 10;
      factors.push('Single contact channel (+10)');
    }

    if (lead.company && lead.company.trim().length > 0) {
      score += 15;
      factors.push('B2B / Corporate entity profile (+15)');
    }

    // 3. Status & Engagement Pipeline
    const status = (lead.status || '').toUpperCase();
    if (status === 'QUALIFIED' || status === 'WON') {
      score += 25;
      factors.push('Qualified buyer intent (+25)');
    } else if (status === 'CONTACTED' || status === 'FOLLOW_UP') {
      score += 15;
      factors.push('Active dialogue in progress (+15)');
    } else if (status === 'NEW') {
      score += 10;
      factors.push('Fresh lead requiring immediate outreach (+10)');
    }

    // Cap score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));

    // Determine Intent Classification & Next Actions
    let intent: 'HOT' | 'WARM' | 'COLD';
    let suggestedNextAction: string;
    let recommendedPriority: 'High' | 'Medium' | 'Low';

    if (finalScore >= 75) {
      intent = 'HOT';
      recommendedPriority = 'High';
      suggestedNextAction = `High-intent buyer! Schedule a live unit tour for ${lead.firstName} ${lead.lastName} and send custom pricing proposal immediately.`;
    } else if (finalScore >= 40) {
      intent = 'WARM';
      recommendedPriority = 'Medium';
      suggestedNextAction = `Follow up with ${lead.firstName} ${lead.lastName} via phone or email within 24 hours to confirm project requirements.`;
    } else {
      intent = 'COLD';
      recommendedPriority = 'Low';
      suggestedNextAction = `Enroll ${lead.firstName} ${lead.lastName} into automated monthly property updates email sequence.`;
    }

    return {
      score: finalScore,
      intent,
      factors,
      suggestedNextAction,
      recommendedPriority,
    };
  }
}
