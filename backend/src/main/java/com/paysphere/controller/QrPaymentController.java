package com.paysphere.controller;

import com.paysphere.dto.request.QrPaymentRequest;
import com.paysphere.dto.response.ApiResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.QrPaymentResponse;
import com.paysphere.dto.response.TransferResponse;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.QrPaymentService;
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

import java.math.BigDecimal;

@RestController
@RequestMapping(AppConstants.API_V1 + "/qr-payments")
@RequiredArgsConstructor
@Tag(name = "QR Payments", description = "Generate and process QR code-based payments")
public class QrPaymentController {

    private final QrPaymentService qrPaymentService;

    @PostMapping("/generate")
    @Operation(summary = "Generate a QR payment code")
    public ResponseEntity<ApiResponse<QrPaymentResponse>> generateQrCode(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QrPaymentRequest request) {
        QrPaymentResponse response = qrPaymentService.generateQrToken(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("QR code generated", response));
    }

    @GetMapping("/token/{token}")
    @Operation(summary = "Get QR token details (for payer preview)")
    public ResponseEntity<ApiResponse<QrPaymentResponse>> getQrTokenInfo(
            @PathVariable String token) {
        QrPaymentResponse response = qrPaymentService.getQrTokenInfo(token);
        return ResponseEntity.ok(ApiResponse.success("QR token info retrieved", response));
    }

    @PostMapping("/pay/{token}")
    @Operation(summary = "Pay via QR code token")
    public ResponseEntity<ApiResponse<TransferResponse>> payViaQr(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String token,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) String note) {
        TransferResponse response = qrPaymentService.payViaQr(userDetails.getId(), token, amount, note);
        return ResponseEntity.ok(ApiResponse.success("QR payment completed", response));
    }

    @GetMapping("/my-codes")
    @Operation(summary = "List your generated QR codes")
    public ResponseEntity<ApiResponse<PagedResponse<QrPaymentResponse>>> getMyQrCodes(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<QrPaymentResponse> response = qrPaymentService.getUserQrTokens(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("QR codes retrieved", response));
    }
}
