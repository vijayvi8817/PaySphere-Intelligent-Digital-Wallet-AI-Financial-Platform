package com.paysphere.service;

import com.paysphere.dto.response.NotificationResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    void createNotification(UUID userId, NotificationType type, String title, String message, String referenceId);

    List<NotificationResponse> getRecentNotifications(UUID userId);

    PagedResponse<NotificationResponse> getNotifications(UUID userId, int page, int size);

    long getUnreadCount(UUID userId);

    void markAsRead(UUID userId, UUID notificationId);

    void markAllAsRead(UUID userId);
}
