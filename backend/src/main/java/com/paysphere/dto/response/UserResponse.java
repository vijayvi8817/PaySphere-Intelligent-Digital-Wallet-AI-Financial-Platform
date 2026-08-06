package com.paysphere.dto.response;

import com.paysphere.enums.KycStatus;
import com.paysphere.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private UserStatus status;
    private KycStatus kycStatus;
    private Set<String> roles;
    private Instant createdAt;
}
