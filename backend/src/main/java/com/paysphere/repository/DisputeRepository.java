package com.paysphere.repository;

import com.paysphere.entity.Dispute;
import com.paysphere.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {

    Page<Dispute> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Dispute> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Dispute> findByStatusOrderByCreatedAtDesc(DisputeStatus status, Pageable pageable);

    Optional<Dispute> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByTransferIdAndUserId(UUID transferId, UUID userId);

    long countByStatus(DisputeStatus status);

    long countByUserId(UUID userId);

    long countByUserIdAndStatus(UUID userId, DisputeStatus status);
}
