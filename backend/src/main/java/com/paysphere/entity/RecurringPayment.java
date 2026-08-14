package com.paysphere.entity;

import com.paysphere.enums.Currency;
import com.paysphere.enums.RecurringPaymentFrequency;
import com.paysphere.enums.RecurringPaymentStatus;
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
import java.time.LocalDate;

@Entity
@Table(name = "recurring_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "recipient_email", nullable = false, length = 100)
    private String recipientEmail;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false, length = 3)
    @Builder.Default
    private Currency currency = Currency.USD;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 10)
    private RecurringPaymentFrequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private RecurringPaymentStatus status = RecurringPaymentStatus.ACTIVE;

    @Column(name = "note")
    private String note;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_execution", nullable = false)
    private LocalDate nextExecution;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "last_executed")
    private Instant lastExecuted;

    @Column(name = "total_executed", nullable = false)
    @Builder.Default
    private Integer totalExecuted = 0;

    @Column(name = "max_executions")
    private Integer maxExecutions;
}
