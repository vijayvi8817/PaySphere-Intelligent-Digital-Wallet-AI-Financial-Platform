package com.paysphere.service.impl;

import com.paysphere.dto.request.DisputeRequest;
import com.paysphere.dto.request.DisputeResolveRequest;
import com.paysphere.dto.response.DisputeResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.entity.Dispute;
import com.paysphere.entity.Transfer;
import com.paysphere.entity.User;
import com.paysphere.enums.DisputeReason;
import com.paysphere.enums.DisputeStatus;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.DisputeMapper;
import com.paysphere.repository.DisputeRepository;
import com.paysphere.repository.TransferRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.DisputeService;
import com.paysphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final TransferRepository transferRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DisputeMapper disputeMapper;

    @Override
    @Transactional
    public DisputeResponse createDispute(UUID userId, DisputeRequest request) {
        log.info("Creating dispute for userId={}, transferId={}", userId, request.getTransferId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        UUID transferId = UUID.fromString(request.getTransferId());
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer", "id", request.getTransferId()));

        // Verify user is a party in the transfer
        boolean isSender = transfer.getSenderUser().getId().equals(userId);
        boolean isReceiver = transfer.getReceiverUser().getId().equals(userId);
        if (!isSender && !isReceiver) {
            throw new BadRequestException("You can only dispute your own transfers");
        }

        // Check for duplicate dispute
        if (disputeRepository.existsByTransferIdAndUserId(transferId, userId)) {
            throw new BadRequestException("You have already filed a dispute for this transfer");
        }

        // Parse reason
        DisputeReason reason;
        try {
            reason = DisputeReason.valueOf(request.getReason().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid reason. Allowed: UNAUTHORIZED, WRONG_AMOUNT, NOT_RECEIVED, DUPLICATE, FRAUD, OTHER");
        }

        Dispute dispute = Dispute.builder()
                .transfer(transfer)
                .user(user)
                .reason(reason)
                .description(request.getDescription())
                .build();

        dispute = disputeRepository.save(dispute);
        log.info("Dispute created: id={}, reason={}", dispute.getId(), reason);

        // Notify the user
        notificationService.createNotification(
                userId,
                com.paysphere.enums.NotificationType.SYSTEM,
                "Dispute Filed",
                "Your dispute for transfer " + transfer.getReferenceId() +
                        " (amount: $" + transfer.getAmount() + ") has been filed and is under review.",
                dispute.getId().toString()
        );

        return disputeMapper.toResponse(dispute, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getDispute(UUID userId, UUID disputeId) {
        Dispute dispute = disputeRepository.findByIdAndUserId(disputeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", disputeId.toString()));
        return disputeMapper.toResponse(dispute, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DisputeResponse> getUserDisputes(UUID userId, int page, int size) {
        Page<Dispute> disputePage = disputeRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, Math.min(size, 50)));

        List<DisputeResponse> content = disputePage.getContent().stream()
                .map(d -> disputeMapper.toResponse(d, userId))
                .toList();

        return PagedResponse.<DisputeResponse>builder()
                .content(content)
                .page(disputePage.getNumber())
                .size(disputePage.getSize())
                .totalElements(disputePage.getTotalElements())
                .totalPages(disputePage.getTotalPages())
                .last(disputePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DisputeResponse> getAllDisputes(int page, int size, String status) {
        Page<Dispute> disputePage;

        if (status != null && !status.isBlank()) {
            try {
                DisputeStatus disputeStatus = DisputeStatus.valueOf(status.toUpperCase());
                disputePage = disputeRepository
                        .findByStatusOrderByCreatedAtDesc(disputeStatus, PageRequest.of(page, Math.min(size, 50)));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter: " + status);
            }
        } else {
            disputePage = disputeRepository
                    .findAllByOrderByCreatedAtDesc(PageRequest.of(page, Math.min(size, 50)));
        }

        List<DisputeResponse> content = disputePage.getContent().stream()
                .map(disputeMapper::toAdminResponse)
                .toList();

        return PagedResponse.<DisputeResponse>builder()
                .content(content)
                .page(disputePage.getNumber())
                .size(disputePage.getSize())
                .totalElements(disputePage.getTotalElements())
                .totalPages(disputePage.getTotalPages())
                .last(disputePage.isLast())
                .build();
    }

    @Override
    @Transactional
    public DisputeResponse resolveDispute(UUID disputeId, DisputeResolveRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", disputeId.toString()));

        if (dispute.getStatus() == DisputeStatus.RESOLVED || dispute.getStatus() == DisputeStatus.REJECTED) {
            throw new BadRequestException("Dispute has already been " + dispute.getStatus().name().toLowerCase());
        }

        // Parse resolution status
        DisputeStatus newStatus;
        try {
            newStatus = DisputeStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid resolution status. Allowed: RESOLVED, REJECTED, UNDER_REVIEW");
        }

        if (newStatus != DisputeStatus.RESOLVED && newStatus != DisputeStatus.REJECTED && newStatus != DisputeStatus.UNDER_REVIEW) {
            throw new BadRequestException("Resolution status must be RESOLVED, REJECTED, or UNDER_REVIEW");
        }

        dispute.setStatus(newStatus);
        dispute.setResolutionNote(request.getResolutionNote());

        if (newStatus == DisputeStatus.RESOLVED || newStatus == DisputeStatus.REJECTED) {
            dispute.setResolvedAt(Instant.now());
        }

        disputeRepository.save(dispute);
        log.info("Dispute resolved: id={}, status={}", disputeId, newStatus);

        // Notify the disputing user
        String title = newStatus == DisputeStatus.RESOLVED ? "Dispute Resolved" : "Dispute Update";
        String message = newStatus == DisputeStatus.RESOLVED
                ? "Your dispute for transfer " + dispute.getTransfer().getReferenceId() + " has been resolved in your favor."
                : newStatus == DisputeStatus.REJECTED
                        ? "Your dispute for transfer " + dispute.getTransfer().getReferenceId() + " has been reviewed and rejected."
                        : "Your dispute for transfer " + dispute.getTransfer().getReferenceId() + " is now under review.";

        notificationService.createNotification(
                dispute.getUser().getId(),
                com.paysphere.enums.NotificationType.SYSTEM,
                title,
                message,
                dispute.getId().toString()
        );

        return disputeMapper.toAdminResponse(dispute);
    }
}
