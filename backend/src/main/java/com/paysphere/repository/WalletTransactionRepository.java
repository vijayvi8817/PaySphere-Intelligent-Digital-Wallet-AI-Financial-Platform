package com.paysphere.repository;

import com.paysphere.entity.WalletTransaction;
import com.paysphere.enums.WalletTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    Page<WalletTransaction> findByWalletId(UUID walletId, Pageable pageable);

    Page<WalletTransaction> findByWalletIdAndType(UUID walletId, WalletTransactionType type, Pageable pageable);

    Optional<WalletTransaction> findByReferenceId(String referenceId);

    boolean existsByReferenceId(String referenceId);

    List<WalletTransaction> findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID walletId, Instant start, Instant end);

    /**
     * Get monthly balance totals for charting.
     */
    @Query("""
            SELECT EXTRACT(MONTH FROM wt.createdAt) as month,
                   EXTRACT(YEAR FROM wt.createdAt) as year,
                   SUM(CASE WHEN wt.type = 'DEPOSIT' THEN wt.amount ELSE 0 END) as deposits,
                   SUM(CASE WHEN wt.type = 'WITHDRAWAL' THEN wt.amount ELSE 0 END) as withdrawals
            FROM WalletTransaction wt
            WHERE wt.wallet.id = :walletId
              AND wt.createdAt >= :since
            GROUP BY EXTRACT(YEAR FROM wt.createdAt), EXTRACT(MONTH FROM wt.createdAt)
            ORDER BY EXTRACT(YEAR FROM wt.createdAt), EXTRACT(MONTH FROM wt.createdAt)
            """)
    List<Object[]> getMonthlyBalanceSummary(@Param("walletId") UUID walletId, @Param("since") Instant since);

    /**
     * Get total deposits for a wallet.
     */
    @Query("SELECT COALESCE(SUM(wt.amount), 0) FROM WalletTransaction wt WHERE wt.wallet.id = :walletId AND wt.type = 'DEPOSIT'")
    BigDecimal getTotalDeposits(@Param("walletId") UUID walletId);

    /**
     * Get total withdrawals for a wallet.
     */
    @Query("SELECT COALESCE(SUM(wt.amount), 0) FROM WalletTransaction wt WHERE wt.wallet.id = :walletId AND wt.type = 'WITHDRAWAL'")
    BigDecimal getTotalWithdrawals(@Param("walletId") UUID walletId);

    /**
     * Count transactions by type.
     */
    long countByWalletIdAndType(UUID walletId, WalletTransactionType type);

    /**
     * Recent transactions (top N).
     */
    List<WalletTransaction> findTop10ByWalletIdOrderByCreatedAtDesc(UUID walletId);
}
