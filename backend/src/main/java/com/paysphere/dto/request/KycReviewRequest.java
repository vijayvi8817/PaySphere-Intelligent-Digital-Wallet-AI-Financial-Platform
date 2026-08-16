package com.paysphere.dto.request;

import com.paysphere.enums.KycStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycReviewRequest {

    @NotNull(message = "Status is required (APPROVED or REJECTED)")
    private KycStatus status;

    private String rejectionReason;
}
