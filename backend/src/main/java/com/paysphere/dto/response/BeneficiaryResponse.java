package com.paysphere.dto.response;

import com.paysphere.enums.BeneficiaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaryResponse {

    private UUID id;
    private String nickname;
    private String email;
    private String accountNumber;
    private BeneficiaryType type;
    private Boolean isFavorite;
    private String beneficiaryName; // resolved from beneficiaryUser if internal
    private Instant createdAt;
}
