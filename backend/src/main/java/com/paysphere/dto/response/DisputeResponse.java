package com.paysphere.dto.response;

import com.paysphere.enums.DisputeReason;
import com.paysphere.enums.DisputeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeResponse {

    private String id;
    private String transferId;
    private String transferReferenceId;
    private BigDecimal transferAmount;
    private String counterpartyName;
    private String counterpartyEmail;
    private DisputeReason reason;
    private DisputeStatus status;
    private String description;
    private String resolutionNote;
    private Instant resolvedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
