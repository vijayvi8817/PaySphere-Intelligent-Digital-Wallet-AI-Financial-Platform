package com.paysphere.entity;

import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 100)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    @Builder.Default
    private AuditCategory category = AuditCategory.SECURITY;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    @Builder.Default
    private AuditSeverity severity = AuditSeverity.INFO;

    @Column(name = "ip_address", length = 50)
    @Builder.Default
    private String ipAddress = "127.0.0.1";

    @Column(name = "user_agent", length = 255)
    @Builder.Default
    private String userAgent = "Browser";

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}
