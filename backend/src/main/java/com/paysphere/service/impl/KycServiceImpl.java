package com.paysphere.service.impl;

import com.paysphere.dto.request.KycReviewRequest;
import com.paysphere.dto.request.KycSubmissionRequest;
import com.paysphere.dto.response.KycDocumentResponse;
import com.paysphere.entity.KycDocument;
import com.paysphere.entity.User;
import com.paysphere.enums.KycStatus;
import com.paysphere.enums.NotificationType;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.KycDocumentRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.KycService;
import com.paysphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycServiceImpl implements KycService {

    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public KycDocumentResponse submitKyc(String userId, KycSubmissionRequest request) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        KycDocument document = KycDocument.builder()
                .user(user)
                .documentType(request.getDocumentType())
                .documentNumber(request.getDocumentNumber())
                .idFrontUrl(request.getIdFrontUrl() != null ? request.getIdFrontUrl() : "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop")
                .idBackUrl(request.getIdBackUrl() != null ? request.getIdBackUrl() : "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop")
                .selfieUrl(request.getSelfieUrl() != null ? request.getSelfieUrl() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop")
                .status(KycStatus.PENDING)
                .build();

        KycDocument saved = kycDocumentRepository.save(document);

        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);

        notificationService.createNotification(
                userUuid,
                NotificationType.SYSTEM,
                "KYC Verification Submitted",
                "Your identity verification document (" + request.getDocumentType() + ") has been received and is currently under review.",
                saved.getId() != null ? saved.getId().toString() : null
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public KycDocumentResponse getLatestKyc(String userId) {
        UUID userUuid = UUID.fromString(userId);
        return kycDocumentRepository.findFirstByUserIdOrderByCreatedAtDesc(userUuid)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<KycDocumentResponse> getUserKycHistory(String userId) {
        UUID userUuid = UUID.fromString(userId);
        return kycDocumentRepository.findByUserIdOrderByCreatedAtDesc(userUuid).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KycDocumentResponse> getPendingKycSubmissions(Pageable pageable) {
        return kycDocumentRepository.findByStatus(KycStatus.PENDING, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public KycDocumentResponse reviewKycSubmission(String adminUserId, String kycDocumentId, KycReviewRequest request) {
        UUID kycUuid = UUID.fromString(kycDocumentId);
        KycDocument document = kycDocumentRepository.findById(kycUuid)
                .orElseThrow(() -> new ResourceNotFoundException("KycDocument", "id", kycDocumentId));

        if (request.getStatus() != KycStatus.APPROVED && request.getStatus() != KycStatus.REJECTED) {
            throw new IllegalArgumentException("Status must be either APPROVED or REJECTED");
        }

        document.setStatus(request.getStatus());
        document.setRejectionReason(request.getStatus() == KycStatus.REJECTED ? request.getRejectionReason() : null);
        document.setReviewedBy(adminUserId);
        document.setReviewedAt(Instant.now());

        KycDocument saved = kycDocumentRepository.save(document);

        User user = document.getUser();
        user.setKycStatus(request.getStatus());
        userRepository.save(user);

        String message = request.getStatus() == KycStatus.APPROVED
                ? "Congratulations! Your identity verification has been approved. Your account is now fully verified."
                : "Your identity verification submission was rejected. Reason: " + request.getRejectionReason();

        notificationService.createNotification(
                user.getId(),
                NotificationType.SYSTEM,
                "KYC Verification " + request.getStatus().name(),
                message,
                saved.getId() != null ? saved.getId().toString() : null
        );

        return mapToResponse(saved);
    }

    private KycDocumentResponse mapToResponse(KycDocument doc) {
        return KycDocumentResponse.builder()
                .id(doc.getId() != null ? doc.getId().toString() : null)
                .userId(doc.getUser().getId() != null ? doc.getUser().getId().toString() : null)
                .userEmail(doc.getUser().getEmail())
                .userName(doc.getUser().getFullName())
                .documentType(doc.getDocumentType())
                .documentNumber(doc.getDocumentNumber())
                .idFrontUrl(doc.getIdFrontUrl())
                .idBackUrl(doc.getIdBackUrl())
                .selfieUrl(doc.getSelfieUrl())
                .status(doc.getStatus())
                .rejectionReason(doc.getRejectionReason())
                .reviewedBy(doc.getReviewedBy())
                .reviewedAt(doc.getReviewedAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
