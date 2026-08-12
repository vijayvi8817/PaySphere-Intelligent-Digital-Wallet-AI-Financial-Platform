package com.paysphere.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaryRequest {

    @NotBlank(message = "Nickname is required")
    @Size(max = 50, message = "Nickname must be 50 characters or less")
    private String nickname;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private Boolean isFavorite;
}
