package com.paysphere.entity;

import com.paysphere.enums.Currency;
import com.paysphere.enums.TransferStatus;
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
import java.time.Instant;

@Entity
@Table(name = "transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transfer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_wallet_id", nullable = false)
    private Wallet senderWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_wallet_id", nullable = false)
    private Wallet receiverWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User senderUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_user_id", nullable = false)
    private User receiverUser;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "fee", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private Currency currency = Currency.USD;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private TransferStatus status = TransferStatus.PENDING;

    @Column(name = "reference_id", nullable = false, unique = true, length = 40)
    private String referenceId;

    @Column(name = "note")
    private String note;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "sender_balance_before", nullable = false, precision = 19, scale = 4)
    private BigDecimal senderBalanceBefore;

    @Column(name = "sender_balance_after", nullable = false, precision = 19, scale = 4)
    private BigDecimal senderBalanceAfter;

    @Column(name = "receiver_balance_before", nullable = false, precision = 19, scale = 4)
    private BigDecimal receiverBalanceBefore;

    @Column(name = "receiver_balance_after", nullable = false, precision = 19, scale = 4)
    private BigDecimal receiverBalanceAfter;

    @Column(name = "completed_at")
    private Instant completedAt;
}
