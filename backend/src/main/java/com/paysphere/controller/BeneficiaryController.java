package com.paysphere.controller;

import com.paysphere.dto.request.BeneficiaryRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.BeneficiaryResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.BeneficiaryService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(AppConstants.API_V1 + "/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiaries", description = "Manage saved transfer recipients")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping
    @Operation(summary = "Add a new beneficiary (saved recipient)")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BeneficiaryRequest request) {
        BeneficiaryResponse beneficiary = beneficiaryService.addBeneficiary(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary added", beneficiary));
    }

    @GetMapping
    @Operation(summary = "Get all beneficiaries (favorites first)")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<BeneficiaryResponse> beneficiaries = beneficiaryService.getBeneficiaries(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Beneficiaries retrieved", beneficiaries));
    }

    @GetMapping("/favorites")
    @Operation(summary = "Get only favorite beneficiaries")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getFavorites(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<BeneficiaryResponse> favorites = beneficiaryService.getFavoriteBeneficiaries(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Favorites retrieved", favorites));
    }

    @PatchMapping("/{id}/favorite")
    @Operation(summary = "Toggle favorite status of a beneficiary")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> toggleFavorite(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        BeneficiaryResponse beneficiary = beneficiaryService.toggleFavorite(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Favorite toggled", beneficiary));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a beneficiary")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id) {
        beneficiaryService.deleteBeneficiary(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary deleted", null));
    }
}
