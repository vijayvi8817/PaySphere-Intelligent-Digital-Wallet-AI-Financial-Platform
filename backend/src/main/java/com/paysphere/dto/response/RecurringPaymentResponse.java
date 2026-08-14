package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPaymentResponse {
    private String id;
    private String recipientEmail;
    private String recipientName;
    private BigDecimal amount;
    private String currency;
    private String frequency;
    private String status;
    private String note;
    private String category;
    private LocalDate startDate;
    private LocalDate nextExecution;
    private LocalDate endDate;
    private Instant lastExecuted;
    private int totalExecuted;
    private Integer maxExecutions;
    private Instant createdAt;
}
