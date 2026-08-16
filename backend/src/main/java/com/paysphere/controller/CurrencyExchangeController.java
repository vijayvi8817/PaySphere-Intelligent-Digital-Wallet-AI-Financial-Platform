package com.paysphere.controller;

import com.paysphere.dto.request.CurrencyExchangeRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.CurrencyWalletResponse;
import com.paysphere.dto.response.ExchangeRateResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.CurrencyExchangeService;
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
@RequestMapping("/api/v1/fx")
@RequiredArgsConstructor
public class CurrencyExchangeController {

    private final CurrencyExchangeService currencyExchangeService;

    @GetMapping("/wallets")
    public ResponseEntity<ApiResponse<List<CurrencyWalletResponse>>> getWallets(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<CurrencyWalletResponse> wallets = currencyExchangeService.getUserCurrencyWallets(currentUser.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("User currency wallets retrieved", wallets));
    }

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<List<ExchangeRateResponse>>> getExchangeRates() {
        List<ExchangeRateResponse> rates = currencyExchangeService.getLiveExchangeRates();
        return ResponseEntity.ok(ApiResponse.success("Live exchange rates retrieved", rates));
    }

    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<CurrencyWalletResponse>> convertCurrency(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody CurrencyExchangeRequest request) {
        CurrencyWalletResponse result = currencyExchangeService.convertCurrency(currentUser.getId().toString(), request);
        return ResponseEntity.ok(ApiResponse.success("Currency conversion completed successfully", result));
    }
}
