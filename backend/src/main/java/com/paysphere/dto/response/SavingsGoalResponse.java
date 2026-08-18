package com.paysphere.dto.response;

import com.paysphere.enums.GoalCategory;
import com.paysphere.enums.GoalStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class SavingsGoalResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private GoalCategory category;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal progressPercentage;
    private LocalDate targetDate;
    private Boolean isAutoRoundupEnabled;
    private GoalStatus status;
    private String color;
    private Instant createdAt;
    private Instant updatedAt;
}
