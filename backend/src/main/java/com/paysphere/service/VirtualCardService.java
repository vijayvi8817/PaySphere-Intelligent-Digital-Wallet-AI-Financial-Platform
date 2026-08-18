package com.paysphere.service;

import com.paysphere.dto.request.CardLimitUpdateRequest;
import com.paysphere.dto.request.CardToggleRequest;
import com.paysphere.dto.request.VirtualCardRequest;
import com.paysphere.dto.response.CardSensitiveResponse;
import com.paysphere.dto.response.VirtualCardResponse;

import java.util.List;
import java.util.UUID;

public interface VirtualCardService {

    VirtualCardResponse issueCard(UUID userId, VirtualCardRequest request);

    List<VirtualCardResponse> getUserCards(UUID userId);

    VirtualCardResponse getCardDetails(UUID userId, UUID cardId);

    VirtualCardResponse toggleFreezeCard(UUID userId, UUID cardId);

    VirtualCardResponse updateLimits(UUID userId, UUID cardId, CardLimitUpdateRequest request);

    VirtualCardResponse toggleSettings(UUID userId, UUID cardId, CardToggleRequest request);

    CardSensitiveResponse revealCardDetails(UUID userId, UUID cardId);

    VirtualCardResponse setCardPin(UUID userId, UUID cardId, String pin);
}
