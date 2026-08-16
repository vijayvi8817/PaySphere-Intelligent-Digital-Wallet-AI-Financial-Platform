package com.paysphere.dto.response;

import com.paysphere.enums.AiInsightType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInsightResponse {
    private String id;
    private AiInsightType insightType;
    private String title;
    private String summary;
    private String recommendation;
    private Integer impactScore;
    private String category;
    private Instant createdAt;
}
