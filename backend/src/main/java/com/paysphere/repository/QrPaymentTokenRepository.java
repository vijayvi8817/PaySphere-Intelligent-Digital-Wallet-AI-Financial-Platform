package com.paysphere.repository;

import com.paysphere.entity.QrPaymentToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QrPaymentTokenRepository extends JpaRepository<QrPaymentToken, UUID> {

    Optional<QrPaymentToken> findByToken(String token);

    Page<QrPaymentToken> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<QrPaymentToken> findByExpiresAtBeforeAndUsedFalse(Instant now);
}
