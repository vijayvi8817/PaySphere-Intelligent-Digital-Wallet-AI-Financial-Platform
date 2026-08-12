package com.paysphere.service;

import com.paysphere.dto.response.AnalyticsResponse;

import java.util.UUID;

public interface AnalyticsService {

    AnalyticsResponse getAnalytics(UUID userId, int months);
}
