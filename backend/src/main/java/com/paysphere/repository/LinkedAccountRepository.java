package com.paysphere.repository;

import com.paysphere.entity.LinkedAccount;
import com.paysphere.enums.LinkedAccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkedAccountRepository extends JpaRepository<LinkedAccount, UUID> {

    List<LinkedAccount> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<LinkedAccount> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, LinkedAccountStatus status);

    Optional<LinkedAccount> findByIdAndUserId(UUID id, UUID userId);

    Optional<LinkedAccount> findByUserIdAndIsPrimaryTrue(UUID userId);

    boolean existsByUserIdAndBankNameAndAccountNumber(UUID userId, String bankName, String accountNumber);

    long countByUserId(UUID userId);
}
