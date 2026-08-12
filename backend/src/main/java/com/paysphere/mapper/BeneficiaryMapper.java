package com.paysphere.mapper;

import com.paysphere.dto.response.BeneficiaryResponse;
import com.paysphere.entity.Beneficiary;
import org.springframework.stereotype.Component;

@Component
public class BeneficiaryMapper {

    public BeneficiaryResponse toResponse(Beneficiary beneficiary) {
        String resolvedName = null;
        if (beneficiary.getBeneficiaryUser() != null) {
            resolvedName = beneficiary.getBeneficiaryUser().getFullName();
        }

        return BeneficiaryResponse.builder()
                .id(beneficiary.getId())
                .nickname(beneficiary.getNickname())
                .email(beneficiary.getEmail())
                .accountNumber(beneficiary.getAccountNumber())
                .type(beneficiary.getType())
                .isFavorite(beneficiary.getIsFavorite())
                .beneficiaryName(resolvedName)
                .createdAt(beneficiary.getCreatedAt())
                .build();
    }
}
