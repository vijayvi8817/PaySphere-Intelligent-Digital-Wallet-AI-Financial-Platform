package com.paysphere.repository;

import com.paysphere.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {

    List<Beneficiary> findByUserIdOrderByIsFavoriteDescCreatedAtDesc(UUID userId);

    List<Beneficiary> findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(UUID userId);

    Optional<Beneficiary> findByUserIdAndEmail(UUID userId, String email);

    Optional<Beneficiary> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndEmail(UUID userId, String email);
}
