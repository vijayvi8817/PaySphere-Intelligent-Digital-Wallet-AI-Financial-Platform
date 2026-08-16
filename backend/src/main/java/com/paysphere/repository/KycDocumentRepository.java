package com.paysphere.repository;

import com.paysphere.entity.KycDocument;
import com.paysphere.enums.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, UUID> {
    List<KycDocument> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<KycDocument> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
    Page<KycDocument> findByStatus(KycStatus status, Pageable pageable);
    long countByStatus(KycStatus status);
}
