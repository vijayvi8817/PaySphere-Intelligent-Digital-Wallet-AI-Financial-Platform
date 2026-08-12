package com.paysphere.controller;

import com.paysphere.dto.request.TransferRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.TransferResponse;
import com.paysphere.dto.response.TransferSummaryResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.TransferService;
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
@RequestMapping(AppConstants.API_V1 + "/transfers")
@RequiredArgsConstructor
@Tag(name = "P2P Transfers", description = "Peer-to-peer money transfers between wallet users")
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    @Operation(summary = "Send money to another user by email")
    public ResponseEntity<ApiResponse<TransferResponse>> sendMoney(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransferRequest request) {
        TransferResponse transfer = transferService.sendMoney(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", transfer));
    }

    @GetMapping("/{transferId}")
    @Operation(summary = "Get transfer details by ID")
    public ResponseEntity<ApiResponse<TransferResponse>> getTransfer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID transferId) {
        TransferResponse transfer = transferService.getTransfer(userDetails.getId(), transferId);
        return ResponseEntity.ok(ApiResponse.success("Transfer retrieved", transfer));
    }

    @GetMapping
    @Operation(summary = "List transfers with optional direction and status filters")
    public ResponseEntity<ApiResponse<PagedResponse<TransferResponse>>> getTransfers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String status) {
        PagedResponse<TransferResponse> transfers =
                transferService.getTransfers(userDetails.getId(), page, size, direction, status);
        return ResponseEntity.ok(ApiResponse.success("Transfers retrieved", transfers));
    }

    @GetMapping("/search")
    @Operation(summary = "Search transfers by keyword (reference ID or note)")
    public ResponseEntity<ApiResponse<PagedResponse<TransferResponse>>> searchTransfers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String keyword,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<TransferResponse> transfers =
                transferService.searchTransfers(userDetails.getId(), keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Search results", transfers));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get monthly transfer summary with totals and recent activity")
    public ResponseEntity<ApiResponse<TransferSummaryResponse>> getTransferSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        TransferSummaryResponse summary = transferService.getTransferSummary(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Transfer summary retrieved", summary));
    }
}
