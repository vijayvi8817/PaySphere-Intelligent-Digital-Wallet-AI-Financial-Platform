package com.paysphere.service.impl;

import com.paysphere.dto.request.WalletDepositRequest;
import com.paysphere.dto.request.WalletWithdrawRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.WalletDashboardResponse;
import com.paysphere.dto.response.WalletResponse;
import com.paysphere.dto.response.WalletStatementResponse;
import com.paysphere.dto.response.WalletTransactionResponse;
import com.paysphere.entity.User;
import com.paysphere.entity.Wallet;
import com.paysphere.entity.WalletTransaction;
import com.paysphere.enums.TransactionStatus;
import com.paysphere.enums.WalletStatus;
import com.paysphere.enums.WalletTransactionType;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.InsufficientBalanceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.WalletMapper;
import com.paysphere.repository.UserRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.repository.WalletTransactionRepository;
import com.paysphere.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.Month;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final WalletMapper walletMapper;

    // Reward rate: 1 point per $10 deposited
    private static final BigDecimal REWARD_RATE = new BigDecimal("10");

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWallet(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse deposit(UUID userId, WalletDepositRequest request) {
        log.info("Processing deposit of {} for user {}", request.getAmount(), userId);

        // Pessimistic lock for concurrency safety
        Wallet wallet = getOrCreateWalletWithLock(userId);

        if (wallet.getStatus() == WalletStatus.FROZEN) {
            throw new BadRequestException("Cannot deposit to a frozen wallet");
        }
        if (wallet.getStatus() == WalletStatus.CLOSED) {
            throw new BadRequestException("Cannot deposit to a closed wallet");
        }

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal balanceAfter = balanceBefore.add(request.getAmount());

        // Calculate reward points (1 point per $10)
        int rewardPoints = request.getAmount()
                .divide(REWARD_RATE, 0, RoundingMode.DOWN)
                .intValue();

        wallet.setBalance(balanceAfter);
        wallet.setRewardPoints(wallet.getRewardPoints() + rewardPoints);
        walletRepository.save(wallet);

        // Record transaction
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.DEPOSIT)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(wallet.getCurrency())
                .status(TransactionStatus.COMPLETED)
                .referenceId(generateReferenceId("DEP"))
                .description(request.getDescription() != null ? request.getDescription() : "Wallet deposit")
                .category(request.getCategory() != null ? request.getCategory() : "Deposit")
                .rewardPoints(rewardPoints)
                .build();

        walletTransactionRepository.save(transaction);

        log.info("Deposit completed. Wallet {} balance: {} -> {}, +{} reward points",
                wallet.getWalletNumber(), balanceBefore, balanceAfter, rewardPoints);

        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse withdraw(UUID userId, WalletWithdrawRequest request) {
        log.info("Processing withdrawal of {} for user {}", request.getAmount(), userId);

        // Pessimistic lock for concurrency safety
        Wallet wallet = getOrCreateWalletWithLock(userId);

        if (wallet.getStatus() == WalletStatus.FROZEN) {
            throw new BadRequestException("Cannot withdraw from a frozen wallet");
        }
        if (wallet.getStatus() == WalletStatus.CLOSED) {
            throw new BadRequestException("Cannot withdraw from a closed wallet");
        }

        BigDecimal balanceBefore = wallet.getBalance();

        if (balanceBefore.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Insufficient balance. Available: %s, Requested: %s",
                            balanceBefore.toPlainString(), request.getAmount().toPlainString()));
        }

        BigDecimal balanceAfter = balanceBefore.subtract(request.getAmount());

        wallet.setBalance(balanceAfter);
        walletRepository.save(wallet);

        // Record transaction
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .currency(wallet.getCurrency())
                .status(TransactionStatus.COMPLETED)
                .referenceId(generateReferenceId("WTH"))
                .description(request.getDescription() != null ? request.getDescription() : "Wallet withdrawal")
                .category(request.getCategory() != null ? request.getCategory() : "Withdrawal")
                .rewardPoints(0)
                .build();

        walletTransactionRepository.save(transaction);

        log.info("Withdrawal completed. Wallet {} balance: {} -> {}",
                wallet.getWalletNumber(), balanceBefore, balanceAfter);

        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse freezeWallet(UUID userId) {
        log.info("Freezing wallet for user {}", userId);

        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getStatus() == WalletStatus.FROZEN) {
            throw new BadRequestException("Wallet is already frozen");
        }
        if (wallet.getStatus() == WalletStatus.CLOSED) {
            throw new BadRequestException("Cannot freeze a closed wallet");
        }

        wallet.setStatus(WalletStatus.FROZEN);
        walletRepository.save(wallet);

        log.info("Wallet {} frozen successfully", wallet.getWalletNumber());
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse unfreezeWallet(UUID userId) {
        log.info("Unfreezing wallet for user {}", userId);

        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getStatus() != WalletStatus.FROZEN) {
            throw new BadRequestException("Wallet is not frozen");
        }

        wallet.setStatus(WalletStatus.ACTIVE);
        walletRepository.save(wallet);

        log.info("Wallet {} unfrozen successfully", wallet.getWalletNumber());
        return walletMapper.toWalletResponse(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<WalletTransactionResponse> getTransactions(UUID userId, int page, int size, String type) {
        Wallet wallet = getOrCreateWallet(userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<WalletTransaction> txPage;
        if (type != null && !type.isBlank()) {
            WalletTransactionType txType = WalletTransactionType.valueOf(type.toUpperCase());
            txPage = walletTransactionRepository.findByWalletIdAndType(wallet.getId(), txType, pageable);
        } else {
            txPage = walletTransactionRepository.findByWalletId(wallet.getId(), pageable);
        }

        List<WalletTransactionResponse> content = txPage.getContent().stream()
                .map(walletMapper::toTransactionResponse)
                .toList();

        return PagedResponse.<WalletTransactionResponse>builder()
                .content(content)
                .page(txPage.getNumber())
                .size(txPage.getSize())
                .totalElements(txPage.getTotalElements())
                .totalPages(txPage.getTotalPages())
                .last(txPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDashboardResponse getDashboard(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
        UUID walletId = wallet.getId();

        // Aggregate data
        BigDecimal totalDeposits = walletTransactionRepository.getTotalDeposits(walletId);
        BigDecimal totalWithdrawals = walletTransactionRepository.getTotalWithdrawals(walletId);
        long depositCount = walletTransactionRepository.countByWalletIdAndType(walletId, WalletTransactionType.DEPOSIT);
        long withdrawalCount = walletTransactionRepository.countByWalletIdAndType(walletId, WalletTransactionType.WITHDRAWAL);
        long totalTransactions = depositCount + withdrawalCount;

        // Recent transactions
        List<WalletTransactionResponse> recentTx = walletTransactionRepository
                .findTop10ByWalletIdOrderByCreatedAtDesc(walletId)
                .stream()
                .map(walletMapper::toTransactionResponse)
                .toList();

        // Monthly balance summary (last 12 months)
        Instant twelveMonthsAgo = YearMonth.now().minusMonths(11).atDay(1)
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        List<Object[]> rawMonthly = walletTransactionRepository.getMonthlyBalanceSummary(walletId, twelveMonthsAgo);

        List<WalletDashboardResponse.MonthlyBalanceSummary> monthlyBalances = rawMonthly.stream()
                .map(row -> {
                    int month = ((Number) row[0]).intValue();
                    int year = ((Number) row[1]).intValue();
                    BigDecimal deposits = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                    BigDecimal withdrawals = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;

                    return WalletDashboardResponse.MonthlyBalanceSummary.builder()
                            .month(month)
                            .year(year)
                            .monthName(Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                            .deposits(deposits)
                            .withdrawals(withdrawals)
                            .net(deposits.subtract(withdrawals))
                            .build();
                })
                .toList();

        return WalletDashboardResponse.builder()
                .wallet(walletMapper.toWalletResponse(wallet))
                .totalDeposits(totalDeposits)
                .totalWithdrawals(totalWithdrawals)
                .totalTransactions(totalTransactions)
                .depositCount(depositCount)
                .withdrawalCount(withdrawalCount)
                .recentTransactions(recentTx)
                .monthlyBalances(monthlyBalances)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WalletStatementResponse getStatement(UUID userId, int month, int year) {
        Wallet wallet = getOrCreateWallet(userId);
        User user = wallet.getUser();

        YearMonth ym = YearMonth.of(year, month);
        Instant periodStart = ym.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant periodEnd = ym.atEndOfMonth().atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        List<WalletTransaction> transactions = walletTransactionRepository
                .findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(wallet.getId(), periodStart, periodEnd);

        BigDecimal totalDeposits = transactions.stream()
                .filter(tx -> tx.getType() == WalletTransactionType.DEPOSIT)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWithdrawals = transactions.stream()
                .filter(tx -> tx.getType() == WalletTransactionType.WITHDRAWAL)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Opening balance = first transaction's balanceBefore, or current balance if no transactions
        BigDecimal openingBalance = transactions.isEmpty()
                ? wallet.getBalance()
                : transactions.get(transactions.size() - 1).getBalanceBefore();

        // Closing balance = last transaction's balanceAfter, or current balance if no transactions
        BigDecimal closingBalance = transactions.isEmpty()
                ? wallet.getBalance()
                : transactions.get(0).getBalanceAfter();

        List<WalletTransactionResponse> txResponses = transactions.stream()
                .map(walletMapper::toTransactionResponse)
                .toList();

        return WalletStatementResponse.builder()
                .walletNumber(wallet.getWalletNumber())
                .ownerName(user.getFullName())
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .totalDeposits(totalDeposits)
                .totalWithdrawals(totalWithdrawals)
                .transactionCount(transactions.size())
                .transactions(txResponses)
                .build();
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Gets an existing wallet or auto-creates one for the user.
     */
    private Wallet getOrCreateWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> createWalletForUser(userId));
    }

    /**
     * Gets an existing wallet with pessimistic lock, or creates one.
     * Used for balance-modifying operations.
     */
    private Wallet getOrCreateWalletWithLock(UUID userId) {
        return walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    // Create first, then re-lock
                    Wallet created = createWalletForUser(userId);
                    return walletRepository.findByIdWithLock(created.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId.toString()));
                });
    }

    /**
     * Creates a new wallet for the specified user.
     */
    private Wallet createWalletForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        Wallet wallet = Wallet.builder()
                .user(user)
                .walletNumber(generateWalletNumber())
                .balance(BigDecimal.ZERO)
                .rewardPoints(0)
                .build();

        wallet = walletRepository.save(wallet);
        log.info("Auto-created wallet {} for user {}", wallet.getWalletNumber(), user.getEmail());
        return wallet;
    }

    /**
     * Generates a unique 16-digit wallet number.
     */
    private String generateWalletNumber() {
        String number;
        do {
            long random = ThreadLocalRandom.current().nextLong(1_000_000_000_000_000L, 9_999_999_999_999_999L);
            number = String.valueOf(random);
        } while (walletRepository.existsByWalletNumber(number));
        return number;
    }

    /**
     * Generates a unique transaction reference ID.
     */
    private String generateReferenceId(String prefix) {
        String ref;
        do {
            ref = prefix + "-" + UUID.randomUUID().toString().substring(0, 28).toUpperCase();
        } while (walletTransactionRepository.existsByReferenceId(ref));
        return ref;
    }
}
