package com.paysphere.controller;

import com.paysphere.dto.request.WalletDepositRequest;
import com.paysphere.dto.request.WalletWithdrawRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.WalletDashboardResponse;
import com.paysphere.dto.response.WalletResponse;
import com.paysphere.dto.response.WalletStatementResponse;
import com.paysphere.dto.response.WalletTransactionResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.WalletService;
import com.paysphere.util.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AppConstants.API_V1 + "/wallet")
@RequiredArgsConstructor
@Tag(name = "Digital Wallet", description = "Wallet operations — view, deposit, withdraw, freeze, statements")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @Operation(summary = "Get current user's wallet")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        WalletResponse wallet = walletService.getWallet(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wallet retrieved", wallet));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Add money to wallet (simulation)")
    public ResponseEntity<ApiResponse<WalletResponse>> deposit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody WalletDepositRequest request) {
        WalletResponse wallet = walletService.deposit(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", wallet));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money from wallet (simulation)")
    public ResponseEntity<ApiResponse<WalletResponse>> withdraw(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody WalletWithdrawRequest request) {
        WalletResponse wallet = walletService.withdraw(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", wallet));
    }

    @PatchMapping("/freeze")
    @Operation(summary = "Freeze wallet — disables deposits and withdrawals")
    public ResponseEntity<ApiResponse<WalletResponse>> freezeWallet(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        WalletResponse wallet = walletService.freezeWallet(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wallet frozen", wallet));
    }

    @PatchMapping("/unfreeze")
    @Operation(summary = "Unfreeze a previously frozen wallet")
    public ResponseEntity<ApiResponse<WalletResponse>> unfreezeWallet(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        WalletResponse wallet = walletService.unfreezeWallet(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wallet unfrozen", wallet));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get wallet transactions with pagination and optional type filter")
    public ResponseEntity<ApiResponse<PagedResponse<WalletTransactionResponse>>> getTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String type) {
        PagedResponse<WalletTransactionResponse> transactions =
                walletService.getTransactions(userDetails.getId(), page, size, type);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", transactions));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get wallet dashboard with charts and summary data")
    public ResponseEntity<ApiResponse<WalletDashboardResponse>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        WalletDashboardResponse dashboard = walletService.getDashboard(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboard));
    }

    @GetMapping("/statement")
    @Operation(summary = "Get wallet statement for a specific month/year")
    public ResponseEntity<ApiResponse<WalletStatementResponse>> getStatement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int month,
            @RequestParam int year) {
        WalletStatementResponse statement = walletService.getStatement(userDetails.getId(), month, year);
        return ResponseEntity.ok(ApiResponse.success("Statement generated", statement));
    }
}
