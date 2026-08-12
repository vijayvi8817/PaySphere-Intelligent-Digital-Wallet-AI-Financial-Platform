package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferSummaryResponse {

    private BigDecimal totalSent;
    private BigDecimal totalReceived;
    private BigDecimal netFlow;
    private long totalTransferCount;
    private long sentCount;
    private long receivedCount;
    private List<TransferResponse> recentTransfers;
}
