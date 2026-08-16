package com.paysphere.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrPaymentRequest {

    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String note;

    @Builder.Default
    private boolean singleUse = true;

    /** Expiry duration in minutes (default: 30) */
    private Integer expiryMinutes;
}
