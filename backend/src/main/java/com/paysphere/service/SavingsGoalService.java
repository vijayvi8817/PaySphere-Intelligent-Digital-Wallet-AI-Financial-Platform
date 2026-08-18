package com.paysphere.service;

import com.paysphere.dto.request.GoalDepositRequest;
import com.paysphere.dto.request.SavingsGoalRequest;
import com.paysphere.dto.response.SavingsGoalResponse;
import com.paysphere.dto.response.SavingsSummaryResponse;

import java.util.UUID;

public interface SavingsGoalService {

    SavingsGoalResponse createGoal(UUID userId, SavingsGoalRequest request);

    SavingsSummaryResponse getSavingsSummary(UUID userId);

    SavingsGoalResponse getGoal(UUID userId, UUID goalId);

    SavingsGoalResponse depositToGoal(UUID userId, UUID goalId, GoalDepositRequest request);

    SavingsGoalResponse withdrawFromGoal(UUID userId, UUID goalId, GoalDepositRequest request);

    SavingsGoalResponse toggleAutoRoundup(UUID userId, UUID goalId);

    void deleteGoal(UUID userId, UUID goalId);
}
