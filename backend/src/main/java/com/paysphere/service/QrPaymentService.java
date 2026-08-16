package com.paysphere.service;

import com.paysphere.dto.request.QrPaymentRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.QrPaymentResponse;
import com.paysphere.dto.response.TransferResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface QrPaymentService {

    QrPaymentResponse generateQrToken(UUID userId, QrPaymentRequest request);

    QrPaymentResponse getQrTokenInfo(String token);

    TransferResponse payViaQr(UUID payerUserId, String token, BigDecimal amount, String note);

    PagedResponse<QrPaymentResponse> getUserQrTokens(UUID userId, int page, int size);
}
