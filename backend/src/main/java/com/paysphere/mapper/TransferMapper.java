package com.paysphere.mapper;

import com.paysphere.dto.response.TransferResponse;
import com.paysphere.entity.Transfer;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TransferMapper {

    /**
     * Maps a Transfer entity to TransferResponse, setting the contextual 'direction'
     * based on who is requesting the data.
     */
    public TransferResponse toResponse(Transfer transfer, UUID requestingUserId) {
        String direction = transfer.getSenderUser().getId().equals(requestingUserId) ? "SENT" : "RECEIVED";

        return TransferResponse.builder()
                .id(transfer.getId())
                .senderName(transfer.getSenderUser().getFullName())
                .senderEmail(transfer.getSenderUser().getEmail())
                .receiverName(transfer.getReceiverUser().getFullName())
                .receiverEmail(transfer.getReceiverUser().getEmail())
                .amount(transfer.getAmount())
                .fee(transfer.getFee())
                .currency(transfer.getCurrency())
                .status(transfer.getStatus())
                .referenceId(transfer.getReferenceId())
                .note(transfer.getNote())
                .category(transfer.getCategory())
                .senderBalanceBefore(transfer.getSenderBalanceBefore())
                .senderBalanceAfter(transfer.getSenderBalanceAfter())
                .receiverBalanceBefore(transfer.getReceiverBalanceBefore())
                .receiverBalanceAfter(transfer.getReceiverBalanceAfter())
                .direction(direction)
                .completedAt(transfer.getCompletedAt())
                .createdAt(transfer.getCreatedAt())
                .build();
    }
}
