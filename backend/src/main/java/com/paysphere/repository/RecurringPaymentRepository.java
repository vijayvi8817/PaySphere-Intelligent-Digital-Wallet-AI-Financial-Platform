package com.paysphere.repository;

import com.paysphere.entity.RecurringPayment;
import com.paysphere.enums.RecurringPaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringPaymentRepository extends JpaRepository<RecurringPayment, UUID> {

    Page<RecurringPayment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<RecurringPayment> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT rp FROM RecurringPayment rp WHERE rp.status = :status AND rp.nextExecution <= :date")
    List<RecurringPayment> findDuePayments(@Param("status") RecurringPaymentStatus status, @Param("date") LocalDate date);

    long countByUserIdAndStatus(UUID userId, RecurringPaymentStatus status);
}
