package com.paysphere.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CardLimitUpdateRequest {

    @NotNull(message = "Daily limit is required")
    @DecimalMin(value = "10.00", message = "Daily limit must be at least 10.00")
    private BigDecimal dailyLimit;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "10.00", message = "Monthly limit must be at least 10.00")
    private BigDecimal monthlyLimit;
}
