package com.paysphere.service.impl;

import com.paysphere.dto.response.AnalyticsResponse;
import com.paysphere.entity.Transfer;
import com.paysphere.entity.Wallet;
import com.paysphere.entity.WalletTransaction;
import com.paysphere.enums.WalletTransactionType;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.TransferRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.repository.WalletTransactionRepository;
import com.paysphere.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final TransferRepository transferRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(UUID userId, int months) {
        log.debug("Generating analytics for userId={}, months={}", userId, months);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId.toString()));

        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusMonths(months).withDayOfMonth(1);
        Instant since = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);

        // Get all transactions in the period
        List<WalletTransaction> transactions = walletTransactionRepository
                .findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                        wallet.getId(), since, Instant.now());

        // Calculate totals
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> isIncome(t.getType()))
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> isExpense(t.getType()))
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgAmount = transactions.isEmpty()
                ? BigDecimal.ZERO
                : totalIncome.add(totalExpenses).divide(
                        BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP);

        int rewardPoints = transactions.stream()
                .mapToInt(WalletTransaction::getRewardPoints)
                .sum();

        // Monthly trends
        List<AnalyticsResponse.MonthlyTrend> monthlyTrends = buildMonthlyTrends(transactions, startDate, now);

        // Category breakdown
        List<AnalyticsResponse.CategoryBreakdown> categoryBreakdown = buildCategoryBreakdown(transactions);

        // Top recipients (from transfers)
        List<AnalyticsResponse.TopRecipient> topRecipients = buildTopRecipients(userId);

        // Daily activity (last 30 days)
        List<AnalyticsResponse.DailyActivity> dailyActivity = buildDailyActivity(transactions);

        return AnalyticsResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netFlow(totalIncome.subtract(totalExpenses))
                .totalTransactions(transactions.size())
                .averageTransactionAmount(avgAmount)
                .rewardPointsEarned(rewardPoints)
                .monthlyTrends(monthlyTrends)
                .categoryBreakdown(categoryBreakdown)
                .topRecipients(topRecipients)
                .dailyActivity(dailyActivity)
                .build();
    }

    private boolean isIncome(WalletTransactionType type) {
        return type == WalletTransactionType.DEPOSIT || type == WalletTransactionType.TRANSFER_RECEIVED;
    }

    private boolean isExpense(WalletTransactionType type) {
        return type == WalletTransactionType.WITHDRAWAL || type == WalletTransactionType.TRANSFER_SENT;
    }

    private List<AnalyticsResponse.MonthlyTrend> buildMonthlyTrends(
            List<WalletTransaction> transactions, LocalDate start, LocalDate end) {

        Map<String, AnalyticsResponse.MonthlyTrend> trendMap = new LinkedHashMap<>();

        // Pre-fill months
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            trendMap.put(key, AnalyticsResponse.MonthlyTrend.builder()
                    .month(cursor.getMonthValue())
                    .year(cursor.getYear())
                    .monthName(cursor.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .income(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .net(BigDecimal.ZERO)
                    .transactionCount(0)
                    .build());
            cursor = cursor.plusMonths(1);
        }

        // Aggregate
        for (WalletTransaction tx : transactions) {
            LocalDate txDate = tx.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
            String key = txDate.getYear() + "-" + txDate.getMonthValue();
            AnalyticsResponse.MonthlyTrend trend = trendMap.get(key);
            if (trend != null) {
                trend.setTransactionCount(trend.getTransactionCount() + 1);
                if (isIncome(tx.getType())) {
                    trend.setIncome(trend.getIncome().add(tx.getAmount()));
                } else if (isExpense(tx.getType())) {
                    trend.setExpenses(trend.getExpenses().add(tx.getAmount()));
                }
                trend.setNet(trend.getIncome().subtract(trend.getExpenses()));
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    private List<AnalyticsResponse.CategoryBreakdown> buildCategoryBreakdown(
            List<WalletTransaction> transactions) {

        Map<String, BigDecimal> categoryAmounts = new LinkedHashMap<>();
        Map<String, Long> categoryCounts = new LinkedHashMap<>();

        for (WalletTransaction tx : transactions) {
            String category = tx.getCategory() != null ? tx.getCategory() : "Uncategorized";
            categoryAmounts.merge(category, tx.getAmount(), BigDecimal::add);
            categoryCounts.merge(category, 1L, Long::sum);
        }

        BigDecimal total = categoryAmounts.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return categoryAmounts.entrySet().stream()
                .map(entry -> AnalyticsResponse.CategoryBreakdown.builder()
                        .category(entry.getKey())
                        .amount(entry.getValue())
                        .count(categoryCounts.get(entry.getKey()))
                        .percentage(total.compareTo(BigDecimal.ZERO) > 0
                                ? entry.getValue().divide(total, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100))
                                        .doubleValue()
                                : 0.0)
                        .build())
                .sorted((a, b) -> Double.compare(b.getPercentage(), a.getPercentage()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.TopRecipient> buildTopRecipients(UUID userId) {
        List<Transfer> sentTransfers = transferRepository
                .findTop5BySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(userId, userId);

        // Group by receiver
        Map<String, BigDecimal> recipientAmounts = new LinkedHashMap<>();
        Map<String, Long> recipientCounts = new LinkedHashMap<>();
        Map<String, String> recipientNames = new LinkedHashMap<>();

        for (Transfer t : sentTransfers) {
            if (t.getSenderUser().getId().equals(userId)) {
                String email = t.getReceiverUser().getEmail();
                recipientAmounts.merge(email, t.getAmount(), BigDecimal::add);
                recipientCounts.merge(email, 1L, Long::sum);
                recipientNames.putIfAbsent(email, t.getReceiverUser().getFullName());
            }
        }

        return recipientAmounts.entrySet().stream()
                .map(entry -> AnalyticsResponse.TopRecipient.builder()
                        .email(entry.getKey())
                        .name(recipientNames.get(entry.getKey()))
                        .totalSent(entry.getValue())
                        .transferCount(recipientCounts.get(entry.getKey()))
                        .build())
                .sorted((a, b) -> b.getTotalSent().compareTo(a.getTotalSent()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.DailyActivity> buildDailyActivity(
            List<WalletTransaction> transactions) {

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);

        Map<String, AnalyticsResponse.DailyActivity> dailyMap = new LinkedHashMap<>();

        // Pre-fill last 30 days
        for (int i = 0; i <= 30; i++) {
            LocalDate date = thirtyDaysAgo.plusDays(i);
            dailyMap.put(date.toString(), AnalyticsResponse.DailyActivity.builder()
                    .date(date.toString())
                    .income(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .count(0)
                    .build());
        }

        for (WalletTransaction tx : transactions) {
            LocalDate txDate = tx.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
            AnalyticsResponse.DailyActivity daily = dailyMap.get(txDate.toString());
            if (daily != null) {
                daily.setCount(daily.getCount() + 1);
                if (isIncome(tx.getType())) {
                    daily.setIncome(daily.getIncome().add(tx.getAmount()));
                } else if (isExpense(tx.getType())) {
                    daily.setExpenses(daily.getExpenses().add(tx.getAmount()));
                }
            }
        }

        return new ArrayList<>(dailyMap.values());
    }
}
