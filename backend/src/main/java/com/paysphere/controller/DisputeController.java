package com.paysphere.controller;

import com.paysphere.dto.request.DisputeRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.DisputeResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.DisputeService;
import com.paysphere.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(AppConstants.API_V1 + "/disputes")
@RequiredArgsConstructor
@Tag(name = "Transaction Disputes", description = "File and manage disputes for transfers")
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    @Operation(summary = "File a dispute for a transfer")
    public ResponseEntity<ApiResponse<DisputeResponse>> createDispute(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DisputeRequest request) {
        DisputeResponse dispute = disputeService.createDispute(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Dispute filed successfully", dispute));
    }

    @GetMapping("/{disputeId}")
    @Operation(summary = "Get dispute details")
    public ResponseEntity<ApiResponse<DisputeResponse>> getDispute(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID disputeId) {
        DisputeResponse dispute = disputeService.getDispute(userDetails.getId(), disputeId);
        return ResponseEntity.ok(ApiResponse.success("Dispute retrieved", dispute));
    }

    @GetMapping
    @Operation(summary = "List your disputes")
    public ResponseEntity<ApiResponse<PagedResponse<DisputeResponse>>> getUserDisputes(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<DisputeResponse> disputes = disputeService.getUserDisputes(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Disputes retrieved", disputes));
    }
}
