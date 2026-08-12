package com.paysphere.repository;

import com.paysphere.entity.Transfer;
import com.paysphere.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, UUID> {

    Optional<Transfer> findByReferenceId(String referenceId);

    /** All transfers where the user is sender or receiver */
    @Query("SELECT t FROM Transfer t WHERE t.senderUser.id = :userId OR t.receiverUser.id = :userId ORDER BY t.createdAt DESC")
    Page<Transfer> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    /** Transfers filtered by status */
    @Query("SELECT t FROM Transfer t WHERE (t.senderUser.id = :userId OR t.receiverUser.id = :userId) AND t.status = :status ORDER BY t.createdAt DESC")
    Page<Transfer> findAllByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") TransferStatus status, Pageable pageable);

    /** Sent transfers only */
    Page<Transfer> findBySenderUserIdOrderByCreatedAtDesc(UUID senderUserId, Pageable pageable);

    /** Received transfers only */
    Page<Transfer> findByReceiverUserIdOrderByCreatedAtDesc(UUID receiverUserId, Pageable pageable);

    /** Count transfers between two dates */
    @Query("SELECT COUNT(t) FROM Transfer t WHERE (t.senderUser.id = :userId OR t.receiverUser.id = :userId) AND t.createdAt BETWEEN :start AND :end")
    long countByUserIdAndDateRange(@Param("userId") UUID userId, @Param("start") Instant start, @Param("end") Instant end);

    /** Sum of sent amounts */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transfer t WHERE t.senderUser.id = :userId AND t.status = 'COMPLETED' AND t.createdAt BETWEEN :start AND :end")
    java.math.BigDecimal sumSentByUserIdAndDateRange(@Param("userId") UUID userId, @Param("start") Instant start, @Param("end") Instant end);

    /** Sum of received amounts */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transfer t WHERE t.receiverUser.id = :userId AND t.status = 'COMPLETED' AND t.createdAt BETWEEN :start AND :end")
    java.math.BigDecimal sumReceivedByUserIdAndDateRange(@Param("userId") UUID userId, @Param("start") Instant start, @Param("end") Instant end);

    /** Recent completed transfers for a user (for dashboard) */
    List<Transfer> findTop5BySenderUserIdOrReceiverUserIdOrderByCreatedAtDesc(UUID senderId, UUID receiverId);

    /** Search by reference_id or note containing keyword */
    @Query("SELECT t FROM Transfer t WHERE (t.senderUser.id = :userId OR t.receiverUser.id = :userId) AND (LOWER(t.referenceId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.note) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY t.createdAt DESC")
    Page<Transfer> searchByKeyword(@Param("userId") UUID userId, @Param("keyword") String keyword, Pageable pageable);
}
