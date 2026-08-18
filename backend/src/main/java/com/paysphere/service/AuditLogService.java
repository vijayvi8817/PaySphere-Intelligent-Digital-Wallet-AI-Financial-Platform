package com.paysphere.service;

import com.paysphere.dto.response.AuditLogResponse;
import com.paysphere.entity.User;
import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AuditLogService {

    void logEvent(User user, AuditAction action, AuditCategory category, AuditSeverity severity, String ipAddress, String userAgent, String details);

    List<AuditLogResponse> getUserLogs(UUID userId);

    List<AuditLogResponse> getRecentSystemLogs();

    Page<AuditLogResponse> filterSystemLogs(AuditCategory category, AuditSeverity severity, Pageable pageable);
}
