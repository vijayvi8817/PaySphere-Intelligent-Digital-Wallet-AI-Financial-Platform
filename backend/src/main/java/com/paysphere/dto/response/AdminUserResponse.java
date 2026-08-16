package com.paysphere.dto.response;

import com.paysphere.enums.KycStatus;
import com.paysphere.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    private KycStatus kycStatus;
    private Set<String> roles;
    private BigDecimal walletBalance;
    private long totalTransfersSent;
    private long totalTransfersReceived;
    private long activeDisputes;
    private Instant createdAt;
    private Instant lastLogin;
}
