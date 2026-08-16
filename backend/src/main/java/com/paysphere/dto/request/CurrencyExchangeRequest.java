package com.paysphere.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyExchangeRequest {

    @NotBlank(message = "From currency is required")
    private String fromCurrency;

    @NotBlank(message = "To currency is required")
    private String toCurrency;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum conversion amount is $1.00")
    private BigDecimal amount;
}
