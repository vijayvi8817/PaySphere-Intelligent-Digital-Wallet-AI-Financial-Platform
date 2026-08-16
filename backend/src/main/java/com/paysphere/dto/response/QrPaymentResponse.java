package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrPaymentResponse {

    private String id;
    private String token;
    private String qrContent;
    private BigDecimal amount;
    private String note;
    private boolean singleUse;
    private boolean used;
    private Instant expiresAt;
    private Instant createdAt;

    // Details about the token owner (for payer display)
    private String recipientName;
    private String recipientEmail;
}
