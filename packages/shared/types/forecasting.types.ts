/**
 * Financial Forecasting & Cash Flow Modeling shared types.
 */

export type ForecastStageBucket = {
  stageId: string;
  stageName: string;
  probability: number;
  dealCount: number;
  rawVolume: number;
  weightedVolume: number;
};

export type MonthlyCashFlowForecast = {
  monthKey: string; // e.g. "2026-10"
  gregorianLabel: string; // e.g. "Oct 2026"
  ethiopianLabel: string; // e.g. "ጥቅምት 2019 ዓ.ም"
  scheduledReceivables: number;
  weightedPipelineInflow: number;
  totalProjectedCashIn: number;
  conservativeScenario: number; // 70% confidence factor
  expectedScenario: number; // 100% standard probability
  optimisticScenario: number; // 125% upside factor
};

export type RevenueForecastReport = {
  totalRawPipeline: number;
  totalWeightedPipeline: number;
  totalScheduledReceivables: number;
  projected12MonthCashIn: number;
  riskAdjustedDelinquencyDiscount: number;
  stages: ForecastStageBucket[];
  monthlyCashFlowForecast: MonthlyCashFlowForecast[];
};
