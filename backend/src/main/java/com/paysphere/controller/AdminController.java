package com.paysphere.controller;

import com.paysphere.dto.request.DisputeResolveRequest;
import com.paysphere.dto.response.AdminStatsResponse;
import com.paysphere.dto.response.AdminUserResponse;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.DisputeResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.service.AdminService;
import com.paysphere.service.DisputeService;
import com.paysphere.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import com.paysphere.dto.request.KycReviewRequest;
import com.paysphere.dto.response.KycDocumentResponse;
import com.paysphere.service.KycService;
import com.paysphere.security.CustomUserDetails;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping(AppConstants.API_V1 + "/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard and user management (ADMIN role required)")
public class AdminController {

    private final AdminService adminService;
    private final DisputeService disputeService;
    private final KycService kycService;
    private final com.paysphere.service.AuditLogService auditLogService;

    @GetMapping("/audit")
    @Operation(summary = "List system audit logs for security monitoring")
    public ResponseEntity<ApiResponse<java.util.List<com.paysphere.dto.response.AuditLogResponse>>> getAuditLogs() {
        java.util.List<com.paysphere.dto.response.AuditLogResponse> logs = auditLogService.getRecentSystemLogs();
        return ResponseEntity.ok(ApiResponse.success("System audit logs retrieved", logs));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get system-wide statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getSystemStats() {
        AdminStatsResponse stats = adminService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success("System stats retrieved", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users with optional filters")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        PagedResponse<AdminUserResponse> users = adminService.getUsers(page, size, status, search);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get detailed user information")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserDetail(
            @PathVariable UUID userId) {
        AdminUserResponse user = adminService.getUserDetail(userId);
        return ResponseEntity.ok(ApiResponse.success("User detail retrieved", user));
    }

    @PatchMapping("/users/{userId}/suspend")
    @Operation(summary = "Suspend a user account")
    public ResponseEntity<ApiResponse<Void>> suspendUser(@PathVariable UUID userId) {
        adminService.suspendUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User suspended", null));
    }

    @PatchMapping("/users/{userId}/activate")
    @Operation(summary = "Activate a user account")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable UUID userId) {
        adminService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User activated", null));
    }

    @GetMapping("/disputes")
    @Operation(summary = "List all disputes with optional status filter")
    public ResponseEntity<ApiResponse<PagedResponse<DisputeResponse>>> getAllDisputes(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String status) {
        PagedResponse<DisputeResponse> disputes = disputeService.getAllDisputes(page, size, status);
        return ResponseEntity.ok(ApiResponse.success("Disputes retrieved", disputes));
    }

    @PatchMapping("/disputes/{disputeId}/resolve")
    @Operation(summary = "Resolve or reject a dispute")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @PathVariable UUID disputeId,
            @Valid @RequestBody DisputeResolveRequest request) {
        DisputeResponse dispute = disputeService.resolveDispute(disputeId, request);
        return ResponseEntity.ok(ApiResponse.success("Dispute updated", dispute));
    }

    @GetMapping("/kyc")
    @Operation(summary = "List pending KYC submissions for review")
    public ResponseEntity<ApiResponse<PagedResponse<KycDocumentResponse>>> getPendingKyc(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        var paged = kycService.getPendingKycSubmissions(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        PagedResponse<KycDocumentResponse> response = PagedResponse.<KycDocumentResponse>builder()
                .content(paged.getContent())
                .page(paged.getNumber())
                .size(paged.getSize())
                .totalElements(paged.getTotalElements())
                .totalPages(paged.getTotalPages())
                .last(paged.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Pending KYC submissions retrieved", response));
    }

    @PatchMapping("/kyc/{kycId}/review")
    @Operation(summary = "Review and approve/reject KYC submission")
    public ResponseEntity<ApiResponse<KycDocumentResponse>> reviewKyc(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable String kycId,
            @Valid @RequestBody KycReviewRequest request) {
        KycDocumentResponse result = kycService.reviewKycSubmission(currentUser.getId().toString(), kycId, request);
        return ResponseEntity.ok(ApiResponse.success("KYC submission reviewed successfully", result));
    }
}
