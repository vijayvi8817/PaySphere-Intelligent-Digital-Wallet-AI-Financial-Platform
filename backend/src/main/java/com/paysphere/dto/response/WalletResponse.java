package com.paysphere.dto.response;

import com.paysphere.enums.Currency;
import com.paysphere.enums.WalletStatus;
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
public class WalletResponse {

    private UUID id;
    private String walletNumber;
    private BigDecimal balance;
    private Integer rewardPoints;
    private Currency currency;
    private WalletStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
