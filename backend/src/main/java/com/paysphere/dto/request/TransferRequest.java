package com.paysphere.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String recipientEmail;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Minimum transfer amount is $0.01")
    private BigDecimal amount;

    @Size(max = 255, message = "Note must be 255 characters or less")
    private String note;

    @Size(max = 50, message = "Category must be 50 characters or less")
    private String category;
}
