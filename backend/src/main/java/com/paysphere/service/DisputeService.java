package com.paysphere.service;

import com.paysphere.dto.request.DisputeRequest;
import com.paysphere.dto.request.DisputeResolveRequest;
import com.paysphere.dto.response.DisputeResponse;
import com.paysphere.dto.response.PagedResponse;

import java.util.UUID;

public interface DisputeService {

    DisputeResponse createDispute(UUID userId, DisputeRequest request);

    DisputeResponse getDispute(UUID userId, UUID disputeId);

    PagedResponse<DisputeResponse> getUserDisputes(UUID userId, int page, int size);

    // Admin operations
    PagedResponse<DisputeResponse> getAllDisputes(int page, int size, String status);

    DisputeResponse resolveDispute(UUID disputeId, DisputeResolveRequest request);
}
