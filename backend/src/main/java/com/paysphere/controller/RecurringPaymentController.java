package com.paysphere.controller;

import com.paysphere.dto.request.RecurringPaymentRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.RecurringPaymentResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.RecurringPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recurring-payments")
@RequiredArgsConstructor
@Tag(name = "Recurring Payments", description = "Recurring payment management")
public class RecurringPaymentController {

    private final RecurringPaymentService recurringPaymentService;

    @PostMapping
    @Operation(summary = "Create a recurring payment")
    public ResponseEntity<ApiResponse<RecurringPaymentResponse>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RecurringPaymentRequest request) {
        RecurringPaymentResponse response = recurringPaymentService.create(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recurring payment created", response));
    }

    @GetMapping
    @Operation(summary = "List all recurring payments")
    public ResponseEntity<ApiResponse<PagedResponse<RecurringPaymentResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<RecurringPaymentResponse> response =
                recurringPaymentService.getAll(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Recurring payments retrieved", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recurring payment details")
    public ResponseEntity<ApiResponse<RecurringPaymentResponse>> getById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        RecurringPaymentResponse response = recurringPaymentService.getById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Recurring payment retrieved", response));
    }

    @PatchMapping("/{id}/pause")
    @Operation(summary = "Pause a recurring payment")
    public ResponseEntity<ApiResponse<RecurringPaymentResponse>> pause(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        RecurringPaymentResponse response = recurringPaymentService.pause(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Recurring payment paused", response));
    }

    @PatchMapping("/{id}/resume")
    @Operation(summary = "Resume a paused recurring payment")
    public ResponseEntity<ApiResponse<RecurringPaymentResponse>> resume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        RecurringPaymentResponse response = recurringPaymentService.resume(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Recurring payment resumed", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a recurring payment")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        recurringPaymentService.cancel(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Recurring payment cancelled", null));
    }
}
