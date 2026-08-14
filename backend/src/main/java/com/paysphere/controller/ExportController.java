package com.paysphere.controller;

import com.paysphere.security.CustomUserDetails;
import com.paysphere.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export and download")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/wallet-transactions")
    @Operation(summary = "Export wallet transactions as CSV")
    public ResponseEntity<byte[]> exportWalletTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        byte[] csv = exportService.exportWalletTransactions(userDetails.getId(), "csv", month, year);

        String filename = "wallet_transactions_"
                + (month != null && year != null ? year + "_" + month : "all")
                + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/transfers")
    @Operation(summary = "Export transfers as CSV")
    public ResponseEntity<byte[]> exportTransfers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false, defaultValue = "all") String direction) {

        byte[] csv = exportService.exportTransfers(userDetails.getId(), "csv", direction);

        String filename = "transfers_" + direction + "_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
