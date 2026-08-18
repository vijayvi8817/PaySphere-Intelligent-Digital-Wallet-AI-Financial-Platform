package com.paysphere.service.impl;

import com.paysphere.dto.response.AuditLogResponse;
import com.paysphere.entity.AuditLog;
import com.paysphere.entity.User;
import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import com.paysphere.repository.AuditLogRepository;
import com.paysphere.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logEvent(User user, AuditAction action, AuditCategory category, AuditSeverity severity, String ipAddress, String userAgent, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .category(category != null ? category : AuditCategory.SECURITY)
                    .severity(severity != null ? severity : AuditSeverity.INFO)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .userAgent(userAgent != null ? userAgent : "Browser")
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit Log Created: [{}] {} - User: {}", severity, action, user != null ? user.getEmail() : "SYSTEM");
        } catch (Exception e) {
            log.error("Failed to persist audit log entry", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getUserLogs(UUID userId) {
        return auditLogRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentSystemLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> filterSystemLogs(AuditCategory category, AuditSeverity severity, Pageable pageable) {
        return auditLogRepository.filterAuditLogs(category, severity, pageable)
                .map(this::mapToResponse);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "SYSTEM")
                .action(log.getAction())
                .category(log.getCategory())
                .severity(log.getSeverity())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
