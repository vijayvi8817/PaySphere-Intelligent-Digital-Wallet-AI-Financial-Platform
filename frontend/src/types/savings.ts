export type GoalCategory = 'EMERGENCY_FUND' | 'VACATION' | 'TECH' | 'VEHICLE' | 'HOUSE' | 'CUSTOM';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  targetDate?: string;
  isAutoRoundupEnabled: boolean;
  status: GoalStatus;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  activeGoalsCount: number;
  isRoundupActive: boolean;
  goals: SavingsGoal[];
}

export interface CreateSavingsGoalRequest {
  name: string;
  category: GoalCategory;
  targetAmount: number;
  targetDate?: string;
  isAutoRoundupEnabled?: boolean;
  color?: string;
}
