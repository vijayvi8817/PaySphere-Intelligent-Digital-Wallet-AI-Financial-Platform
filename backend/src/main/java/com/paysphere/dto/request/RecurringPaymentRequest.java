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
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPaymentRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String recipientEmail;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum recurring amount is $1.00")
    private BigDecimal amount;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    @Size(max = 255, message = "Note must not exceed 255 characters")
    private String note;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer maxExecutions;
}
