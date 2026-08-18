package com.paysphere.dto.response;

import com.paysphere.enums.CardNetwork;
import com.paysphere.enums.CardStatus;
import com.paysphere.enums.CardType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class VirtualCardResponse {
    private UUID id;
    private UUID userId;
    private String cardNumberMasked;
    private String cardholderName;
    private Integer expiryMonth;
    private Integer expiryYear;
    private CardType cardType;
    private CardNetwork cardNetwork;
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private BigDecimal spentThisMonth;
    private Boolean isFrozen;
    private Boolean onlinePaymentsEnabled;
    private Boolean internationalPaymentsEnabled;
    private Boolean atmWithdrawalsEnabled;
    private CardStatus status;
    private Instant createdAt;
}
