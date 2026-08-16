package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAdvisorResponse {
    private Integer healthScore;
    private String healthStatus; // e.g. EXCELLENT, GOOD, FAIR, NEEDS_ATTENTION
    private BigDecimal monthlySavingsPotential;
    private List<AiInsightResponse> insights;
    private String aiSummaryPromptAdvice;
}
