package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netFlow;
    private long totalTransactions;
    private BigDecimal averageTransactionAmount;
    private int rewardPointsEarned;

    private List<MonthlyTrend> monthlyTrends;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<TopRecipient> topRecipients;
    private List<DailyActivity> dailyActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private int month;
        private int year;
        private String monthName;
        private BigDecimal income;
        private BigDecimal expenses;
        private BigDecimal net;
        private long transactionCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryBreakdown {
        private String category;
        private BigDecimal amount;
        private long count;
        private double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopRecipient {
        private String name;
        private String email;
        private BigDecimal totalSent;
        private long transferCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyActivity {
        private String date;
        private BigDecimal income;
        private BigDecimal expenses;
        private long count;
    }
}
