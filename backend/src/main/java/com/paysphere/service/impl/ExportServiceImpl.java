package com.paysphere.service.impl;

import com.paysphere.entity.Transfer;
import com.paysphere.entity.Wallet;
import com.paysphere.entity.WalletTransaction;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.TransferRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.repository.WalletTransactionRepository;
import com.paysphere.service.ExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportServiceImpl implements ExportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneOffset.UTC);

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final TransferRepository transferRepository;

    @Override
    @Transactional(readOnly = true)
    public byte[] exportWalletTransactions(UUID userId, String format, Integer month, Integer year) {
        log.info("Exporting wallet transactions for userId={}, month={}, year={}", userId, month, year);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId.toString()));

        List<WalletTransaction> transactions;

        if (month != null && year != null) {
            // Date-ranged export
            Instant start = LocalDate.of(year, month, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant end = LocalDate.of(year, month, 1).plusMonths(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            transactions = walletTransactionRepository.findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    wallet.getId(), start, end);
        } else {
            // All transactions (cap at 1000)
            transactions = walletTransactionRepository
                    .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0, 1000))
                    .getContent();
        }

        return generateWalletTransactionCsv(transactions);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportTransfers(UUID userId, String format, String direction) {
        log.info("Exporting transfers for userId={}, direction={}", userId, direction);

        List<Transfer> transfers;

        if ("sent".equalsIgnoreCase(direction)) {
            transfers = transferRepository.findBySenderUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 1000))
                    .getContent();
        } else if ("received".equalsIgnoreCase(direction)) {
            transfers = transferRepository.findByReceiverUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 1000))
                    .getContent();
        } else {
            transfers = transferRepository.findAllByUserId(userId, PageRequest.of(0, 1000))
                    .getContent();
        }

        return generateTransferCsv(transfers, userId);
    }

    private byte[] generateWalletTransactionCsv(List<WalletTransaction> transactions) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(baos, true, StandardCharsets.UTF_8);

        // Header
        pw.println("Date,Type,Description,Category,Amount,Balance Before,Balance After,Status,Reference");

        for (WalletTransaction tx : transactions) {
            pw.printf("%s,%s,\"%s\",\"%s\",%s,%s,%s,%s,%s%n",
                    DATE_FORMAT.format(tx.getCreatedAt()),
                    tx.getType(),
                    escapeCsv(tx.getDescription()),
                    escapeCsv(tx.getCategory()),
                    tx.getAmount(),
                    tx.getBalanceBefore(),
                    tx.getBalanceAfter(),
                    tx.getStatus(),
                    tx.getReferenceId());
        }

        pw.flush();
        return baos.toByteArray();
    }

    private byte[] generateTransferCsv(List<Transfer> transfers, UUID userId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(baos, true, StandardCharsets.UTF_8);

        // Header
        pw.println("Date,Direction,Counterparty,Amount,Fee,Currency,Status,Note,Category,Reference");

        for (Transfer t : transfers) {
            boolean isSender = t.getSenderUser().getId().equals(userId);
            String direction = isSender ? "SENT" : "RECEIVED";
            String counterparty = isSender
                    ? t.getReceiverUser().getFullName() + " (" + t.getReceiverUser().getEmail() + ")"
                    : t.getSenderUser().getFullName() + " (" + t.getSenderUser().getEmail() + ")";

            pw.printf("%s,%s,\"%s\",%s,%s,%s,%s,\"%s\",\"%s\",%s%n",
                    DATE_FORMAT.format(t.getCreatedAt()),
                    direction,
                    escapeCsv(counterparty),
                    t.getAmount(),
                    t.getFee(),
                    t.getCurrency(),
                    t.getStatus(),
                    escapeCsv(t.getNote()),
                    escapeCsv(t.getCategory()),
                    t.getReferenceId());
        }

        pw.flush();
        return baos.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
