package com.paysphere.repository;

import com.paysphere.entity.VirtualCard;
import com.paysphere.enums.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VirtualCardRepository extends JpaRepository<VirtualCard, UUID> {

    List<VirtualCard> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<VirtualCard> findByUserIdAndStatus(UUID userId, CardStatus status);

    Optional<VirtualCard> findByIdAndUserId(UUID id, UUID userId);
}
