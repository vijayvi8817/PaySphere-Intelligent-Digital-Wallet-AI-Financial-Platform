package com.paysphere.repository;

import com.paysphere.entity.Transaction;
import com.paysphere.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findBySourceAccountIdOrDestinationAccountId(UUID sourceId, UUID destId, Pageable pageable);

    Optional<Transaction> findByReferenceId(String referenceId);

    boolean existsByReferenceId(String referenceId);

    Page<Transaction> findBySourceAccountIdAndStatus(UUID accountId, TransactionStatus status, Pageable pageable);
}
