package com.paysphere.dto.response;

import com.paysphere.enums.LinkedAccountStatus;
import com.paysphere.enums.LinkedAccountType;
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
public class LinkedAccountResponse {

    private UUID id;
    private String accountName;
    private String bankName;
    private String maskedAccountNumber;
    private String routingNumber;
    private LinkedAccountType accountType;
    private LinkedAccountStatus status;
    private boolean primary;
    private Instant createdAt;
}
