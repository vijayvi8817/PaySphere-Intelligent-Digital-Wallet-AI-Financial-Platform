package com.paysphere.controller;

import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.AuditLogResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Security & Audit Logs", description = "Endpoints for user security activity logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/me")
    @Operation(summary = "Get current user's security audit history")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getMyAuditLogs(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<AuditLogResponse> logs = auditLogService.getUserLogs(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User audit log retrieved successfully", logs));
    }
}
