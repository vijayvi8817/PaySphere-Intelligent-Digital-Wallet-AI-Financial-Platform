package com.paysphere.controller;

import com.paysphere.dto.response.AnalyticsResponse;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.AnalyticsService;
import com.paysphere.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AppConstants.API_V1 + "/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Financial analytics, trends, and spending insights")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get financial analytics dashboard data")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "6") int months) {
        AnalyticsResponse analytics = analyticsService.getAnalytics(userDetails.getId(), months);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }
}
