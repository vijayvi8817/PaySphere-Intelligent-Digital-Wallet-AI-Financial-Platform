package com.paysphere.repository;

import com.paysphere.entity.AuditLog;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AuditLog> findTop100ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM AuditLog a WHERE (:category IS NULL OR a.category = :category) AND (:severity IS NULL OR a.severity = :severity) ORDER BY a.createdAt DESC")
    Page<AuditLog> filterAuditLogs(@Param("category") AuditCategory category, @Param("severity") AuditSeverity severity, Pageable pageable);
}
