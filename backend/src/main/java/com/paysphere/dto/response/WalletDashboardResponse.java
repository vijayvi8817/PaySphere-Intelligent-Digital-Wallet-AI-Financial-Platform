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
public class WalletDashboardResponse {

    private WalletResponse wallet;
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private long totalTransactions;
    private long depositCount;
    private long withdrawalCount;
    private List<WalletTransactionResponse> recentTransactions;
    private List<MonthlyBalanceSummary> monthlyBalances;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyBalanceSummary {
        private int month;
        private int year;
        private String monthName;
        private BigDecimal deposits;
        private BigDecimal withdrawals;
        private BigDecimal net;
    }
}
