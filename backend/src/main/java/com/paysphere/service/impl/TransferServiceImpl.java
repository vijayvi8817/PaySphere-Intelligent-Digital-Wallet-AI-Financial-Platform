package com.paysphere.service.impl;

import com.paysphere.dto.request.TransferRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.TransferResponse;
import com.paysphere.dto.response.TransferSummaryResponse;
import com.paysphere.entity.Transfer;
import com.paysphere.entity.User;
import com.paysphere.entity.Wallet;
import com.paysphere.entity.WalletTransaction;
import com.paysphere.enums.TransactionStatus;
import com.paysphere.enums.TransferStatus;
import com.paysphere.enums.WalletStatus;
import com.paysphere.enums.WalletTransactionType;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.InsufficientBalanceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.TransferMapper;
import com.paysphere.repository.TransferRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.repository.WalletTransactionRepository;
import com.paysphere.service.NotificationService;
import com.paysphere.service.TransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransferServiceImpl implements TransferService {

    private static final BigDecimal TRANSFER_FEE_RATE = new BigDecimal("0.005"); // 0.5%
    private static final BigDecimal MAX_TRANSFER_AMOUNT = new BigDecimal("50000.00");
    private static final BigDecimal MIN_TRANSFER_AMOUNT = new BigDecimal("0.01");
    private static final int REWARD_POINTS_PER_TRANSFER = 5;

    private final TransferRepository transferRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final TransferMapper transferMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TransferResponse sendMoney(UUID senderUserId, TransferRequest request) {
        log.info("Processing P2P transfer from userId={} to email={}, amount={}",
                senderUserId, request.getRecipientEmail(), request.getAmount());

        // 1. Validate amount range
        if (request.getAmount().compareTo(MIN_TRANSFER_AMOUNT) < 0) {
            throw new BadRequestException("Minimum transfer amount is $" + MIN_TRANSFER_AMOUNT);
        }
        if (request.getAmount().compareTo(MAX_TRANSFER_AMOUNT) > 0) {
            throw new BadRequestException("Maximum transfer amount is $" + MAX_TRANSFER_AMOUNT);
        }

        // 2. Look up recipient user (case-insensitive)
        User recipientUser = userRepository.findByEmailIgnoreCase(request.getRecipientEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getRecipientEmail()));

        // 3. Cannot send to yourself
        if (recipientUser.getId().equals(senderUserId)) {
            throw new BadRequestException("Cannot transfer money to yourself");
        }

        // 4. Lock both wallets (order by ID to prevent deadlocks)
        UUID senderId = senderUserId;
        UUID receiverId = recipientUser.getId();

        Wallet senderWallet;
        Wallet receiverWallet;

        // Always lock in consistent order (smaller UUID first) to prevent deadlocks
        if (senderId.compareTo(receiverId) < 0) {
            senderWallet = getOrCreateWalletWithLock(senderId);
            receiverWallet = getOrCreateWalletWithLock(receiverId);
        } else {
            receiverWallet = getOrCreateWalletWithLock(receiverId);
            senderWallet = getOrCreateWalletWithLock(senderId);
        }

        // 5. Validate wallet statuses
        if (senderWallet.getStatus() != WalletStatus.ACTIVE) {
            throw new BadRequestException("Your wallet is " + senderWallet.getStatus() + ". Cannot send money.");
        }
        if (receiverWallet.getStatus() != WalletStatus.ACTIVE) {
            throw new BadRequestException("Recipient's wallet is not active. Cannot complete transfer.");
        }

        // 6. Calculate fee and total deduction
        BigDecimal fee = request.getAmount().multiply(TRANSFER_FEE_RATE)
                .setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalDeduction = request.getAmount().add(fee);

        // 7. Verify sufficient balance
        if (senderWallet.getBalance().compareTo(totalDeduction) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance. Required: $" + totalDeduction +
                    " (amount $" + request.getAmount() + " + fee $" + fee +
                    "), available: $" + senderWallet.getBalance());
        }

        // 8. Record balance snapshots
        BigDecimal senderBalanceBefore = senderWallet.getBalance();
        BigDecimal receiverBalanceBefore = receiverWallet.getBalance();

        // 9. Update balances
        senderWallet.setBalance(senderBalanceBefore.subtract(totalDeduction));
        receiverWallet.setBalance(receiverBalanceBefore.add(request.getAmount()));

        BigDecimal senderBalanceAfter = senderWallet.getBalance();
        BigDecimal receiverBalanceAfter = receiverWallet.getBalance();

        // 10. Award reward points
        senderWallet.setRewardPoints(senderWallet.getRewardPoints() + REWARD_POINTS_PER_TRANSFER);

        // 11. Persist wallet updates
        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // 12. Generate unique reference
        String referenceId = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 13. Create Transfer record
        User senderUser = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderUserId.toString()));

        Transfer transfer = Transfer.builder()
                .senderWallet(senderWallet)
                .receiverWallet(receiverWallet)
                .senderUser(senderUser)
                .receiverUser(recipientUser)
                .amount(request.getAmount())
                .fee(fee)
                .status(TransferStatus.COMPLETED)
                .referenceId(referenceId)
                .note(request.getNote())
                .category(request.getCategory())
                .senderBalanceBefore(senderBalanceBefore)
                .senderBalanceAfter(senderBalanceAfter)
                .receiverBalanceBefore(receiverBalanceBefore)
                .receiverBalanceAfter(receiverBalanceAfter)
                .completedAt(Instant.now())
                .build();

        transfer = transferRepository.save(transfer);

        // 14. Create wallet transaction ledger entries for both parties
        WalletTransaction senderTx = WalletTransaction.builder()
                .wallet(senderWallet)
                .type(WalletTransactionType.TRANSFER_SENT)
                .amount(totalDeduction)
                .balanceBefore(senderBalanceBefore)
                .balanceAfter(senderBalanceAfter)
                .status(TransactionStatus.COMPLETED)
                .referenceId("WTX-S-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description("Transfer to " + recipientUser.getFullName() + (request.getNote() != null ? " — " + request.getNote() : ""))
                .category(request.getCategory() != null ? request.getCategory() : "Transfer")
                .rewardPoints(REWARD_POINTS_PER_TRANSFER)
                .build();

        WalletTransaction receiverTx = WalletTransaction.builder()
                .wallet(receiverWallet)
                .type(WalletTransactionType.TRANSFER_RECEIVED)
                .amount(request.getAmount())
                .balanceBefore(receiverBalanceBefore)
                .balanceAfter(receiverBalanceAfter)
                .status(TransactionStatus.COMPLETED)
                .referenceId("WTX-R-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description("Transfer from " + senderUser.getFullName() + (request.getNote() != null ? " — " + request.getNote() : ""))
                .category(request.getCategory() != null ? request.getCategory() : "Transfer")
                .rewardPoints(0)
                .build();

        walletTransactionRepository.save(senderTx);
        walletTransactionRepository.save(receiverTx);

        log.info("P2P transfer completed: {} → {}, amount=${}, fee=${}, ref={}",
                senderUser.getEmail(), recipientUser.getEmail(), request.getAmount(), fee, referenceId);

        // 15. Push notifications to both parties
        notificationService.createNotification(senderUserId,
                com.paysphere.enums.NotificationType.TRANSFER_SENT,
                "Money Sent",
                "You sent $" + request.getAmount() + " to " + recipientUser.getFullName() + ". Ref: " + referenceId,
                referenceId);

        notificationService.createNotification(recipientUser.getId(),
                com.paysphere.enums.NotificationType.TRANSFER_RECEIVED,
                "Money Received",
                "You received $" + request.getAmount() + " from " + senderUser.getFullName() + ". Ref: " + referenceId,
                referenceId);

        return transferMapper.toResponse(transfer, senderUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public TransferResponse getTransfer(UUID userId, UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer", "id", transferId.toString()));

        // Ensure the user is involved in this transfer
        if (!transfer.getSenderUser().getId().equals(userId) && !transfer.getReceiverUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Transfer", "id", transferId.toString());
        }

        return transferMapper.toResponse(transfer, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransferResponse> getTransfers(UUID userId, int page, int size, String direction, String status) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Transfer> transferPage;

        if (status != null && !status.isBlank()) {
            TransferStatus transferStatus = TransferStatus.valueOf(status.toUpperCase());
            transferPage = transferRepository.findAllByUserIdAndStatus(userId, transferStatus, pageable);
        } else if ("sent".equalsIgnoreCase(direction)) {
            transferPage = transferRepository.findBySenderUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if ("received".equalsIgnoreCase(direction)) {
            transferPage = transferRepository.findByReceiverUserIdOrderByCreatedAtDesc(userId, pageable);
        } else {
            transferPage = transferRepository.findAllByUserId(userId, pageable);
        }

        List<TransferResponse> content = transferPage.getContent().stream()
                .map(t -> transferMapper.toResponse(t, userId))
                .toList();

        return PagedResponse.<TransferResponse>builder()
                .content(content)
                .page(transferPage.getNumber())
                .size(transferPage.getSize())
                .totalElements(transferPage.getTotalElements())
                .totalPages(transferPage.getTotalPages())
                .last(transferPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransferResponse> searchTransfers(UUID userId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Transfer> transferPage = transferRepository.searchByKeyword(userId, keyword, pageable);

        List<TransferResponse> content = transferPage.getContent().stream()
                .map(t -> transferMapper.toResponse(t, userId))
                .toList();

        return PagedResponse.<TransferResponse>builder()
                .content(content)
                .page(transferPage.getNumber())
                .size(transferPage.getSize())
                .totalElements(transferPage.getTotalElements())
                .totalPages(transferPage.getTotalPages())
                .last(transferPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TransferSummaryResponse getTransferSummary(UUID userId) {
        LocalDate now = LocalDate.now();
        Instant monthStart = now.withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant monthEnd = now.plusMonths(1).withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal totalSent = transferRepository.sumSentByUserIdAndDateRange(userId, monthStart, monthEnd);
        BigDecimal totalReceived = transferRepository.sumReceivedByUserIdAndDateRange(userId, monthStart, monthEnd);
        long transferCount = transferRepository.countByUserIdAndDateRange(userId, monthStart, monthEnd);

        List<Transfer> recent = transferRepository.findTop5BySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId);
        List<TransferResponse> recentResponses = recent.stream()
                .map(t -> transferMapper.toResponse(t, userId))
                .toList();

        return TransferSummaryResponse.builder()
                .totalSent(totalSent)
                .totalReceived(totalReceived)
                .netFlow(totalReceived.subtract(totalSent))
                .totalTransferCount(transferCount)
                .sentCount(recent.stream().filter(t -> t.getSenderUser().getId().equals(userId)).count())
                .receivedCount(recent.stream().filter(t -> t.getReceiverUser().getId().equals(userId)).count())
                .recentTransfers(recentResponses)
                .build();
    }

    private Wallet getOrCreateWalletWithLock(UUID userId) {
        return walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
                    String walletNumber = String.valueOf((long) (Math.random() * 9_000_000_000_000_000L) + 1_000_000_000_000_000L);
                    Wallet created = Wallet.builder()
                            .user(user)
                            .walletNumber(walletNumber)
                            .balance(BigDecimal.ZERO)
                            .rewardPoints(0)
                            .build();
                    created = walletRepository.save(created);
                    return walletRepository.findByIdWithLock(created.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId.toString()));
                });
    }
}
