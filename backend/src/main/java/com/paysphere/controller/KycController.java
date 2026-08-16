package com.paysphere.controller;

import com.paysphere.dto.request.KycSubmissionRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.KycDocumentResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping
    public ResponseEntity<ApiResponse<KycDocumentResponse>> submitKyc(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody KycSubmissionRequest request) {
        KycDocumentResponse response = kycService.submitKyc(currentUser.getId().toString(), request);
        return ResponseEntity.ok(ApiResponse.success("KYC submission recorded successfully", response));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<KycDocumentResponse>> getLatestKyc(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        KycDocumentResponse response = kycService.getLatestKyc(currentUser.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Latest KYC details retrieved", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<KycDocumentResponse>>> getKycHistory(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<KycDocumentResponse> history = kycService.getUserKycHistory(currentUser.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("KYC history retrieved", history));
    }
}
