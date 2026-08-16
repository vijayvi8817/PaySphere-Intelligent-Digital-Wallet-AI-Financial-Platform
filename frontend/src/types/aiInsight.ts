export type AiInsightType = 
  | 'SPENDING_ANOMALY'
  | 'SAVINGS_OPPORTUNITY'
  | 'BUDGET_ALERT'
  | 'SUBSCRIPTION_OPTIMIZATION'
  | 'FINANCIAL_HEALTH_SCORE';

export interface AiInsightResponse {
  id: string;
  insightType: AiInsightType;
  title: string;
  summary: string;
  recommendation?: string;
  impactScore: number;
  category: string;
  createdAt: string;
}

export interface AiAdvisorResponse {
  healthScore: number;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
  monthlySavingsPotential: number;
  insights: AiInsightResponse[];
  aiSummaryPromptAdvice: string;
}
