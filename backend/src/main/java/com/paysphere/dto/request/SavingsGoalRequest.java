package com.paysphere.dto.request;

import com.paysphere.enums.GoalCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingsGoalRequest {

    @NotBlank(message = "Goal name is required")
    private String name;

    private GoalCategory category = GoalCategory.CUSTOM;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.00", message = "Target amount must be at least 1.00")
    private BigDecimal targetAmount;

    private LocalDate targetDate;

    private Boolean isAutoRoundupEnabled = false;

    private String color = "bg-emerald-500";
}
