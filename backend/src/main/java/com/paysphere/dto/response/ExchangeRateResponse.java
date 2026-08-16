package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateResponse {
    private String id;
    private String baseCurrency;
    private String targetCurrency;
    private BigDecimal rate;
    private BigDecimal feePercentage;
}
