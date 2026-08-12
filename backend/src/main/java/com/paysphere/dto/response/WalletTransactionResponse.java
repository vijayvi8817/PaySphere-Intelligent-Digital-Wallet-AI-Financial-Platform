package com.paysphere.dto.response;

import com.paysphere.enums.Currency;
import com.paysphere.enums.TransactionStatus;
import com.paysphere.enums.WalletTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransactionResponse {

    private UUID id;
    private WalletTransactionType type;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private Currency currency;
    private TransactionStatus status;
    private String referenceId;
    private String description;
    private String category;
    private Integer rewardPoints;
    private Instant createdAt;
}
