package com.paysphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeResolveRequest {

    @NotBlank(message = "Resolution status is required (RESOLVED or REJECTED)")
    private String status;

    @NotBlank(message = "Resolution note is required")
    @Size(min = 5, max = 2000, message = "Resolution note must be between 5 and 2000 characters")
    private String resolutionNote;
}
