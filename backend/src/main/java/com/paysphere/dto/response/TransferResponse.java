package com.paysphere.dto.response;

import com.paysphere.enums.Currency;
import com.paysphere.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferResponse {

    private UUID id;
    private String senderName;
    private String senderEmail;
    private String receiverName;
    private String receiverEmail;
    private BigDecimal amount;
    private BigDecimal fee;
    private Currency currency;
    private TransferStatus status;
    private String referenceId;
    private String note;
    private String category;
    private BigDecimal senderBalanceBefore;
    private BigDecimal senderBalanceAfter;
    private BigDecimal receiverBalanceBefore;
    private BigDecimal receiverBalanceAfter;
    private String direction; // SENT or RECEIVED — set contextually for the requesting user
    private Instant completedAt;
    private Instant createdAt;
}
