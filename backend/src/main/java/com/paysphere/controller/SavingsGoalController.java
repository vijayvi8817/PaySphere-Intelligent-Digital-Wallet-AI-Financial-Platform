package com.paysphere.controller;

import com.paysphere.dto.request.GoalDepositRequest;
import com.paysphere.dto.request.SavingsGoalRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.SavingsGoalResponse;
import com.paysphere.dto.response.SavingsSummaryResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.SavingsGoalService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/savings")
@RequiredArgsConstructor
@Tag(name = "Savings Goals & Micro-Investments", description = "Endpoints for managing savings goals & round-ups")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @PostMapping
    @Operation(summary = "Create a new savings goal vault")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> createGoal(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse goal = savingsGoalService.createGoal(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Savings goal created successfully", goal));
    }

    @GetMapping
    @Operation(summary = "Get user's savings summary and active goals")
    public ResponseEntity<ApiResponse<SavingsSummaryResponse>> getSavingsSummary(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        SavingsSummaryResponse summary = savingsGoalService.getSavingsSummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Savings summary retrieved successfully", summary));
    }

    @GetMapping("/{goalId}")
    @Operation(summary = "Get details of a specific savings goal")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> getGoal(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID goalId) {
        SavingsGoalResponse goal = savingsGoalService.getGoal(currentUser.getId(), goalId);
        return ResponseEntity.ok(ApiResponse.success("Goal details retrieved successfully", goal));
    }

    @PostMapping("/{goalId}/deposit")
    @Operation(summary = "Deposit money into savings goal from main wallet")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> depositToGoal(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID goalId,
            @Valid @RequestBody GoalDepositRequest request) {
        SavingsGoalResponse goal = savingsGoalService.depositToGoal(currentUser.getId(), goalId, request);
        return ResponseEntity.ok(ApiResponse.success("Deposit to savings goal successful", goal));
    }

    @PostMapping("/{goalId}/withdraw")
    @Operation(summary = "Withdraw money from savings goal back to main wallet")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> withdrawFromGoal(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID goalId,
            @Valid @RequestBody GoalDepositRequest request) {
        SavingsGoalResponse goal = savingsGoalService.withdrawFromGoal(currentUser.getId(), goalId, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal from savings goal successful", goal));
    }

    @PatchMapping("/{goalId}/roundup")
    @Operation(summary = "Toggle auto round-up deposits for this goal")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> toggleAutoRoundup(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID goalId) {
        SavingsGoalResponse goal = savingsGoalService.toggleAutoRoundup(currentUser.getId(), goalId);
        return ResponseEntity.ok(ApiResponse.success("Auto round-up setting updated", goal));
    }

    @DeleteMapping("/{goalId}")
    @Operation(summary = "Delete savings goal and refund remaining balance")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable UUID goalId) {
        savingsGoalService.deleteGoal(currentUser.getId(), goalId);
        return ResponseEntity.ok(ApiResponse.success("Savings goal deleted and balance refunded", null));
    }
}
