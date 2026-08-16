package com.paysphere.service;

import com.paysphere.dto.response.AiAdvisorResponse;
import com.paysphere.dto.response.AiInsightResponse;

import java.util.List;

public interface AiInsightService {
    AiAdvisorResponse getAiAdvisorSummary(String userId);
    List<AiInsightResponse> generateAndGetInsights(String userId);
    AiAdvisorResponse askAiQuestion(String userId, String questionPrompt);
}
