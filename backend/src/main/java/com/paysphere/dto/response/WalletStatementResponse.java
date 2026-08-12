package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletStatementResponse {

    private String walletNumber;
    private String ownerName;
    private Instant periodStart;
    private Instant periodEnd;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private int transactionCount;
    private List<WalletTransactionResponse> transactions;
}
