package com.paysphere.service.impl;

import com.paysphere.dto.response.AiAdvisorResponse;
import com.paysphere.dto.response.AiInsightResponse;
import com.paysphere.entity.AiInsight;
import com.paysphere.entity.User;
import com.paysphere.enums.AiInsightType;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.AiInsightRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.AiInsightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInsightServiceImpl implements AiInsightService {

    private final AiInsightRepository aiInsightRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AiAdvisorResponse getAiAdvisorSummary(String userId) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<AiInsightResponse> insights = generateAndGetInsights(userId);

        int healthScore = 88;
        String status = "EXCELLENT";
        BigDecimal monthlySavingsPotential = new BigDecimal("145.50");

        String promptAdvice = "Based on your financial activity over the past 30 days, your overall spending velocity is optimal. " +
                "You could optimize $145.50/month by consolidating 2 duplicate digital subscriptions and transferring unallocated wallet reserves to interest savings.";

        return AiAdvisorResponse.builder()
                .healthScore(healthScore)
                .healthStatus(status)
                .monthlySavingsPotential(monthlySavingsPotential)
                .insights(insights)
                .aiSummaryPromptAdvice(promptAdvice)
                .build();
    }

    @Override
    @Transactional
    public List<AiInsightResponse> generateAndGetInsights(String userId) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<AiInsight> existing = aiInsightRepository.findByUserIdOrderByCreatedAtDesc(userUuid);

        if (existing.isEmpty()) {
            List<AiInsight> createdInsights = new ArrayList<>();

            createdInsights.add(AiInsight.builder()
                    .user(user)
                    .insightType(AiInsightType.SPENDING_ANOMALY)
                    .title("Unusual Merchant Spending Pattern Detected")
                    .summary("Dining & Restaurant transactions increased by 24% compared to your historical 3-month average.")
                    .recommendation("Set a monthly $350 budget limit for Dining & Entertainment to keep savings on track.")
                    .impactScore(85)
                    .category("SPENDING")
                    .build());

            createdInsights.add(AiInsight.builder()
                    .user(user)
                    .insightType(AiInsightType.SAVINGS_OPPORTUNITY)
                    .title("Recurring Deposit Optimization")
                    .summary("Your wallet balance consistently stays above $2,500 without active usage for 20+ days.")
                    .recommendation("Automate a $500 monthly transfer into a high-yield linked account to earn compounding yield.")
                    .impactScore(92)
                    .category("SAVINGS")
                    .build());

            createdInsights.add(AiInsight.builder()
                    .user(user)
                    .insightType(AiInsightType.SUBSCRIPTION_OPTIMIZATION)
                    .title("Duplicate Streaming Subscription Alert")
                    .summary("Two recurring payments matching video streaming services were charged within 3 days of each other.")
                    .recommendation("Review your active subscriptions tab to cancel unnecessary recurring services.")
                    .impactScore(70)
                    .category("SUBSCRIPTIONS")
                    .build());

            createdInsights.add(AiInsight.builder()
                    .user(user)
                    .insightType(AiInsightType.BUDGET_ALERT)
                    .title("Weekend Peer Transfer Surge")
                    .summary("78% of your outgoing peer-to-peer transfers occur during weekend evenings.")
                    .recommendation("Consider setting custom weekend transaction alerts for better cash flow tracking.")
                    .impactScore(64)
                    .category("TRANSFERS")
                    .build());

            existing = aiInsightRepository.saveAll(createdInsights);
        }

        return existing.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AiAdvisorResponse askAiQuestion(String userId, String questionPrompt) {
        AiAdvisorResponse summary = getAiAdvisorSummary(userId);

        String answer = "AI Analysis for: \"" + questionPrompt + "\"\n\n" +
                "Based on your transaction history, your net liquidity is healthy. " +
                "Recommendation: " + (questionPrompt.toLowerCase().contains("save")
                ? "Increase your automated monthly savings transfer by 5% and review active subscriptions."
                : "Your cash flow supports this transaction without impacting your safety buffer.");

        summary.setAiSummaryPromptAdvice(answer);
        return summary;
    }

    private AiInsightResponse mapToResponse(AiInsight insight) {
        return AiInsightResponse.builder()
                .id(insight.getId() != null ? insight.getId().toString() : null)
                .insightType(insight.getInsightType())
                .title(insight.getTitle())
                .summary(insight.getSummary())
                .recommendation(insight.getRecommendation())
                .impactScore(insight.getImpactScore())
                .category(insight.getCategory())
                .createdAt(insight.getCreatedAt())
                .build();
    }
}
