package com.paysphere.service;

import com.paysphere.dto.request.KycReviewRequest;
import com.paysphere.dto.request.KycSubmissionRequest;
import com.paysphere.dto.response.KycDocumentResponse;
import com.paysphere.enums.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface KycService {
    KycDocumentResponse submitKyc(String userId, KycSubmissionRequest request);
    KycDocumentResponse getLatestKyc(String userId);
    List<KycDocumentResponse> getUserKycHistory(String userId);
    Page<KycDocumentResponse> getPendingKycSubmissions(Pageable pageable);
    KycDocumentResponse reviewKycSubmission(String adminUserId, String kycDocumentId, KycReviewRequest request);
}
