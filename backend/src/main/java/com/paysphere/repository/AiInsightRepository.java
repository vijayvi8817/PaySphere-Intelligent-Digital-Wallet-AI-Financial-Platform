package com.paysphere.repository;

import com.paysphere.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {
    List<AiInsight> findByUserIdOrderByCreatedAtDesc(UUID userId);
    void deleteByUserId(UUID userId);
}
