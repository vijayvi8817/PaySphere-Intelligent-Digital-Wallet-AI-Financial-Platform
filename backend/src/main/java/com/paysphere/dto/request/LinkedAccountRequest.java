package com.paysphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedAccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 100, message = "Account name must be 100 characters or less")
    private String accountName;

    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name must be 100 characters or less")
    private String bankName;

    @NotBlank(message = "Account number is required")
    @Size(min = 4, max = 30, message = "Account number must be between 4 and 30 characters")
    @Pattern(regexp = "^[0-9]+$", message = "Account number must contain only digits")
    private String accountNumber;

    @Size(max = 20, message = "Routing number must be 20 characters or less")
    @Pattern(regexp = "^[0-9]*$", message = "Routing number must contain only digits")
    private String routingNumber;

    private String accountType; // CHECKING, SAVINGS, BUSINESS

    private Boolean isPrimary;
}
