package com.paysphere.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SavingsSummaryResponse {
    private BigDecimal totalSaved;
    private BigDecimal totalTarget;
    private Integer activeGoalsCount;
    private Boolean isRoundupActive;
    private List<SavingsGoalResponse> goals;
}
