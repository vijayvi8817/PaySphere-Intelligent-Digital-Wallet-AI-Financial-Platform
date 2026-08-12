package com.paysphere.service;

import com.paysphere.dto.request.BeneficiaryRequest;
import com.paysphere.dto.response.BeneficiaryResponse;

import java.util.List;
import java.util.UUID;

public interface BeneficiaryService {

    BeneficiaryResponse addBeneficiary(UUID userId, BeneficiaryRequest request);

    List<BeneficiaryResponse> getBeneficiaries(UUID userId);

    List<BeneficiaryResponse> getFavoriteBeneficiaries(UUID userId);

    BeneficiaryResponse toggleFavorite(UUID userId, UUID beneficiaryId);

    void deleteBeneficiary(UUID userId, UUID beneficiaryId);
}
