package com.paysphere.entity;

import com.paysphere.enums.CardNetwork;
import com.paysphere.enums.CardStatus;
import com.paysphere.enums.CardType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "virtual_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VirtualCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "card_number_masked", nullable = false, length = 20)
    private String cardNumberMasked;

    @Column(name = "card_number_encrypted", nullable = false, length = 255)
    private String cardNumberEncrypted;

    @Column(name = "cardholder_name", nullable = false, length = 100)
    private String cardholderName;

    @Column(name = "expiry_month", nullable = false)
    private Integer expiryMonth;

    @Column(name = "expiry_year", nullable = false)
    private Integer expiryYear;

    @Column(name = "cvv", nullable = false, length = 4)
    private String cvv;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false, length = 20)
    @Builder.Default
    private CardType cardType = CardType.VIRTUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_network", nullable = false, length = 20)
    @Builder.Default
    private CardNetwork cardNetwork = CardNetwork.VISA;

    @Column(name = "daily_limit", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal dailyLimit = new BigDecimal("1000.00");

    @Column(name = "monthly_limit", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal monthlyLimit = new BigDecimal("5000.00");

    @Column(name = "spent_this_month", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spentThisMonth = BigDecimal.ZERO;

    @Column(name = "is_frozen", nullable = false)
    @Builder.Default
    private Boolean isFrozen = false;

    @Column(name = "online_payments_enabled", nullable = false)
    @Builder.Default
    private Boolean onlinePaymentsEnabled = true;

    @Column(name = "international_payments_enabled", nullable = false)
    @Builder.Default
    private Boolean internationalPaymentsEnabled = false;

    @Column(name = "atm_withdrawals_enabled", nullable = false)
    @Builder.Default
    private Boolean atmWithdrawalsEnabled = true;

    @Column(name = "pin", length = 4)
    @Builder.Default
    private String pin = "1234";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;
}
