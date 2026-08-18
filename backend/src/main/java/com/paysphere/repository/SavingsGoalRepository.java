package com.paysphere.repository;

import com.paysphere.entity.SavingsGoal;
import com.paysphere.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {

    List<SavingsGoal> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<SavingsGoal> findByUserIdAndStatus(UUID userId, GoalStatus status);

    Optional<SavingsGoal> findByUserIdAndIsAutoRoundupEnabledTrue(UUID userId);

    @Query("SELECT COALESCE(SUM(sg.currentAmount), 0) FROM SavingsGoal sg WHERE sg.user.id = :userId AND sg.status = 'ACTIVE'")
    BigDecimal sumTotalSavedByUserId(@Param("userId") UUID userId);
}
