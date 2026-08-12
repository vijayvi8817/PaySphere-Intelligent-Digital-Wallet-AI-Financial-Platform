package com.paysphere.mapper;

import com.paysphere.dto.response.WalletResponse;
import com.paysphere.dto.response.WalletTransactionResponse;
import com.paysphere.entity.Wallet;
import com.paysphere.entity.WalletTransaction;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletResponse toWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .walletNumber(wallet.getWalletNumber())
                .balance(wallet.getBalance())
                .rewardPoints(wallet.getRewardPoints())
                .currency(wallet.getCurrency())
                .status(wallet.getStatus())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    public WalletTransactionResponse toTransactionResponse(WalletTransaction tx) {
        return WalletTransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .currency(tx.getCurrency())
                .status(tx.getStatus())
                .referenceId(tx.getReferenceId())
                .description(tx.getDescription())
                .category(tx.getCategory())
                .rewardPoints(tx.getRewardPoints())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
