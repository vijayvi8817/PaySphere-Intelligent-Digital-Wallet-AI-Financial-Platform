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
public class CurrencyWalletResponse {
    private String id;
    private String currency;
    private BigDecimal balance;
    private String symbol;
    private String currencyName;
}
