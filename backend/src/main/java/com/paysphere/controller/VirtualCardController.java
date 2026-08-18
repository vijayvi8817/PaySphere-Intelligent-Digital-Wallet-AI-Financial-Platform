package com.paysphere.controller;

import com.paysphere.dto.request.CardLimitUpdateRequest;
import com.paysphere.dto.request.CardToggleRequest;
import com.paysphere.dto.request.VirtualCardRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.CardSensitiveResponse;
import com.paysphere.dto.response.VirtualCardResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.VirtualCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Tag(name = "Virtual & Physical Cards", description = "Endpoints for card issuance and management")
public class VirtualCardController {

    private final VirtualCardService virtualCardService;

    @PostMapping
    @Operation(summary = "Issue a new virtual or physical payment card")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> issueCard(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody VirtualCardRequest request) {
        VirtualCardResponse card = virtualCardService.issueCard(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Card issued successfully", card));
    }

    @GetMapping
    @Operation(summary = "Get all user payment cards")
    public ResponseEntity<ApiResponse<List<VirtualCardResponse>>> getUserCards(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<VirtualCardResponse> cards = virtualCardService.getUserCards(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cards retrieved successfully", cards));
    }

    @GetMapping("/{cardId}")
    @Operation(summary = "Get card details")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> getCardDetails(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId) {
        VirtualCardResponse card = virtualCardService.getCardDetails(currentUser.getId(), cardId);
        return ResponseEntity.ok(ApiResponse.success("Card details retrieved successfully", card));
    }

    @PatchMapping("/{cardId}/freeze")
    @Operation(summary = "Freeze or unfreeze card")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> toggleFreezeCard(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId) {
        VirtualCardResponse card = virtualCardService.toggleFreezeCard(currentUser.getId(), cardId);
        return ResponseEntity.ok(ApiResponse.success("Card freeze status updated", card));
    }

    @PatchMapping("/{cardId}/limits")
    @Operation(summary = "Update daily and monthly card spending limits")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> updateLimits(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId,
            @Valid @RequestBody CardLimitUpdateRequest request) {
        VirtualCardResponse card = virtualCardService.updateLimits(currentUser.getId(), cardId, request);
        return ResponseEntity.ok(ApiResponse.success("Card spending limits updated", card));
    }

    @PatchMapping("/{cardId}/settings")
    @Operation(summary = "Toggle online payments, international payments, or ATM access")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> toggleSettings(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId,
            @RequestBody CardToggleRequest request) {
        VirtualCardResponse card = virtualCardService.toggleSettings(currentUser.getId(), cardId, request);
        return ResponseEntity.ok(ApiResponse.success("Card settings updated", card));
    }

    @PostMapping("/{cardId}/reveal")
    @Operation(summary = "Securely reveal full 16-digit card number and CVV")
    public ResponseEntity<ApiResponse<CardSensitiveResponse>> revealCardDetails(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId) {
        CardSensitiveResponse details = virtualCardService.revealCardDetails(currentUser.getId(), cardId);
        return ResponseEntity.ok(ApiResponse.success("Card credentials revealed securely", details));
    }

    @PatchMapping("/{cardId}/pin")
    @Operation(summary = "Set or change 4-digit card PIN")
    public ResponseEntity<ApiResponse<VirtualCardResponse>> setCardPin(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID cardId,
            @RequestParam String pin) {
        VirtualCardResponse card = virtualCardService.setCardPin(currentUser.getId(), cardId, pin);
        return ResponseEntity.ok(ApiResponse.success("Card PIN updated successfully", card));
    }
}
