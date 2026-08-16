package com.paysphere.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "exchange_rates",
    uniqueConstraints = @UniqueConstraint(columnNames = {"base_currency", "target_currency"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRate extends BaseEntity {

    @Column(name = "base_currency", nullable = false, length = 10)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false, length = 10)
    private String targetCurrency;

    @Column(name = "rate", nullable = false, precision = 12, scale = 6)
    private BigDecimal rate;

    @Column(name = "fee_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal feePercentage = new BigDecimal("0.50");
}
