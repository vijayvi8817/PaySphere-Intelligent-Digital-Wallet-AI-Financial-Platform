package com.paysphere.service;

import com.paysphere.dto.request.TransferRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.TransferResponse;
import com.paysphere.dto.response.TransferSummaryResponse;

import java.util.UUID;

public interface TransferService {

    TransferResponse sendMoney(UUID senderUserId, TransferRequest request);

    TransferResponse getTransfer(UUID userId, UUID transferId);

    PagedResponse<TransferResponse> getTransfers(UUID userId, int page, int size, String direction, String status);

    PagedResponse<TransferResponse> searchTransfers(UUID userId, String keyword, int page, int size);

    TransferSummaryResponse getTransferSummary(UUID userId);
}
