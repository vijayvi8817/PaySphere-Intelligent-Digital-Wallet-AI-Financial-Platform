package com.paysphere.mapper;

import com.paysphere.dto.response.LinkedAccountResponse;
import com.paysphere.entity.LinkedAccount;
import org.springframework.stereotype.Component;

@Component
public class LinkedAccountMapper {

    public LinkedAccountResponse toResponse(LinkedAccount account) {
        return LinkedAccountResponse.builder()
                .id(account.getId())
                .accountName(account.getAccountName())
                .bankName(account.getBankName())
                .maskedAccountNumber(maskAccountNumber(account.getAccountNumber()))
                .routingNumber(account.getRoutingNumber())
                .accountType(account.getAccountType())
                .status(account.getStatus())
                .primary(account.getIsPrimary())
                .createdAt(account.getCreatedAt())
                .build();
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return accountNumber;
        }
        String lastFour = accountNumber.substring(accountNumber.length() - 4);
        String masked = "*".repeat(accountNumber.length() - 4);
        return masked + lastFour;
    }
}
