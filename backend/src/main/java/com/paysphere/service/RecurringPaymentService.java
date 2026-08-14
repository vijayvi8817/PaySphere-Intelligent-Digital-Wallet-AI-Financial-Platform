package com.paysphere.service;

import com.paysphere.dto.request.RecurringPaymentRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.RecurringPaymentResponse;

import java.util.UUID;

public interface RecurringPaymentService {

    RecurringPaymentResponse create(UUID userId, RecurringPaymentRequest request);

    RecurringPaymentResponse getById(UUID userId, UUID paymentId);

    PagedResponse<RecurringPaymentResponse> getAll(UUID userId, int page, int size);

    RecurringPaymentResponse pause(UUID userId, UUID paymentId);

    RecurringPaymentResponse resume(UUID userId, UUID paymentId);

    void cancel(UUID userId, UUID paymentId);

    void processDuePayments();
}
