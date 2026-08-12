package com.paysphere.controller;

import com.paysphere.dto.request.LinkedAccountRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.LinkedAccountResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.LinkedAccountService;
import com.paysphere.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(AppConstants.API_V1 + "/linked-accounts")
@RequiredArgsConstructor
@Tag(name = "Linked Accounts", description = "Manage linked bank accounts")
public class LinkedAccountController {

    private final LinkedAccountService linkedAccountService;

    @PostMapping
    @Operation(summary = "Link a new bank account")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> addAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody LinkedAccountRequest request) {
        LinkedAccountResponse account = linkedAccountService.addAccount(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Account linked successfully", account));
    }

    @GetMapping
    @Operation(summary = "List all linked bank accounts")
    public ResponseEntity<ApiResponse<List<LinkedAccountResponse>>> getAccounts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<LinkedAccountResponse> accounts = linkedAccountService.getAccounts(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Linked accounts retrieved", accounts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific linked account")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> getAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        LinkedAccountResponse account = linkedAccountService.getAccount(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Account retrieved", account));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a linked account")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> updateAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody LinkedAccountRequest request) {
        LinkedAccountResponse account = linkedAccountService.updateAccount(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Account updated", account));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a linked account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        linkedAccountService.deleteAccount(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Account removed", null));
    }

    @PatchMapping("/{id}/primary")
    @Operation(summary = "Set an account as primary")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> setPrimary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        LinkedAccountResponse account = linkedAccountService.setPrimary(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Account set as primary", account));
    }

    @PatchMapping("/{id}/verify")
    @Operation(summary = "Verify a linked account (simulation)")
    public ResponseEntity<ApiResponse<LinkedAccountResponse>> verifyAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        LinkedAccountResponse account = linkedAccountService.verifyAccount(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Account verified", account));
    }
}
