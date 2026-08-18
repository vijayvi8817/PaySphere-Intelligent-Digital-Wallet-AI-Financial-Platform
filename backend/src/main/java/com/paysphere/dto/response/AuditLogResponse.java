package com.paysphere.dto.response;

import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AuditLogResponse {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private AuditAction action;
    private AuditCategory category;
    private AuditSeverity severity;
    private String ipAddress;
    private String userAgent;
    private String details;
    private Instant createdAt;
}
