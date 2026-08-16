package com.paysphere.mapper;

import com.paysphere.dto.response.DisputeResponse;
import com.paysphere.entity.Dispute;
import com.paysphere.entity.Transfer;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DisputeMapper {

    /**
     * Maps a Dispute entity to DisputeResponse, including context about the
     * counterparty (the other side of the transfer from the disputing user's perspective).
     */
    public DisputeResponse toResponse(Dispute dispute, UUID requestingUserId) {
        Transfer transfer = dispute.getTransfer();

        // Determine counterparty — the other participant in the transfer
        boolean isSender = transfer.getSenderUser().getId().equals(requestingUserId);
        String counterpartyName = isSender
                ? transfer.getReceiverUser().getFullName()
                : transfer.getSenderUser().getFullName();
        String counterpartyEmail = isSender
                ? transfer.getReceiverUser().getEmail()
                : transfer.getSenderUser().getEmail();

        return DisputeResponse.builder()
                .id(dispute.getId().toString())
                .transferId(transfer.getId().toString())
                .transferReferenceId(transfer.getReferenceId())
                .transferAmount(transfer.getAmount())
                .counterpartyName(counterpartyName)
                .counterpartyEmail(counterpartyEmail)
                .reason(dispute.getReason())
                .status(dispute.getStatus())
                .description(dispute.getDescription())
                .resolutionNote(dispute.getResolutionNote())
                .resolvedAt(dispute.getResolvedAt())
                .createdAt(dispute.getCreatedAt())
                .updatedAt(dispute.getUpdatedAt())
                .build();
    }

    /**
     * Admin mapping — uses the disputing user as the "counterparty" context.
     */
    public DisputeResponse toAdminResponse(Dispute dispute) {
        Transfer transfer = dispute.getTransfer();

        return DisputeResponse.builder()
                .id(dispute.getId().toString())
                .transferId(transfer.getId().toString())
                .transferReferenceId(transfer.getReferenceId())
                .transferAmount(transfer.getAmount())
                .counterpartyName(dispute.getUser().getFullName())
                .counterpartyEmail(dispute.getUser().getEmail())
                .reason(dispute.getReason())
                .status(dispute.getStatus())
                .description(dispute.getDescription())
                .resolutionNote(dispute.getResolutionNote())
                .resolvedAt(dispute.getResolvedAt())
                .createdAt(dispute.getCreatedAt())
                .updatedAt(dispute.getUpdatedAt())
                .build();
    }
}
