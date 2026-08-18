package com.paysphere.service.impl;

import com.paysphere.dto.request.GoalDepositRequest;
import com.paysphere.dto.request.SavingsGoalRequest;
import com.paysphere.dto.request.WalletWithdrawRequest;
import com.paysphere.dto.request.WalletDepositRequest;
import com.paysphere.dto.response.SavingsGoalResponse;
import com.paysphere.dto.response.SavingsSummaryResponse;
import com.paysphere.entity.SavingsGoal;
import com.paysphere.entity.User;
import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import com.paysphere.enums.GoalStatus;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.SavingsGoalRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.AuditLogService;
import com.paysphere.service.SavingsGoalService;
import com.paysphere.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsGoalServiceImpl implements SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public SavingsGoalResponse createGoal(UUID userId, SavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // If auto-roundup is requested, disable auto-roundup on any existing goal for this user
        if (Boolean.TRUE.equals(request.getIsAutoRoundupEnabled())) {
            savingsGoalRepository.findByUserIdAndIsAutoRoundupEnabledTrue(userId)
                    .ifPresent(existing -> {
                        existing.setIsAutoRoundupEnabled(false);
                        savingsGoalRepository.save(existing);
                    });
        }

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .targetAmount(request.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .isAutoRoundupEnabled(request.getIsAutoRoundupEnabled() != null ? request.getIsAutoRoundupEnabled() : false)
                .status(GoalStatus.ACTIVE)
                .color(request.getColor() != null ? request.getColor() : "bg-emerald-500")
                .build();

        goal = savingsGoalRepository.save(goal);

        auditLogService.logEvent(user, AuditAction.SAVINGS_GOAL_CREATED, AuditCategory.TRANSACTION, AuditSeverity.INFO,
                "127.0.0.1", "Browser", "Created savings goal: " + goal.getName() + " ($" + goal.getTargetAmount() + ")");

        return mapToResponse(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public SavingsSummaryResponse getSavingsSummary(UUID userId) {
        List<SavingsGoal> goals = savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(userId);

        BigDecimal totalSaved = goals.stream()
                .map(SavingsGoal::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTarget = goals.stream()
                .map(SavingsGoal::getTargetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean isRoundupActive = goals.stream().anyMatch(g -> Boolean.TRUE.equals(g.getIsAutoRoundupEnabled()));

        List<SavingsGoalResponse> goalResponses = goals.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return SavingsSummaryResponse.builder()
                .totalSaved(totalSaved)
                .totalTarget(totalTarget)
                .activeGoalsCount(goals.size())
                .isRoundupActive(isRoundupActive)
                .goals(goalResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SavingsGoalResponse getGoal(UUID userId, UUID goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", goalId.toString()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to savings goal");
        }

        return mapToResponse(goal);
    }

    @Override
    @Transactional
    public SavingsGoalResponse depositToGoal(UUID userId, UUID goalId, GoalDepositRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", goalId.toString()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to savings goal");
        }

        // Deduct money from user wallet
        WalletWithdrawRequest withdrawReq = new WalletWithdrawRequest();
        withdrawReq.setAmount(request.getAmount());
        withdrawReq.setDescription("Deposit to savings goal: " + goal.getName());
        withdrawReq.setCategory("Savings Vault");
        walletService.withdraw(userId, withdrawReq);

        // Update goal balance
        BigDecimal newAmount = goal.getCurrentAmount().add(request.getAmount());
        goal.setCurrentAmount(newAmount);

        if (newAmount.compareTo(goal.getTargetAmount()) >= 0 && goal.getStatus() == GoalStatus.ACTIVE) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        savingsGoalRepository.save(goal);

        auditLogService.logEvent(goal.getUser(), AuditAction.SAVINGS_DEPOSIT, AuditCategory.TRANSACTION, AuditSeverity.INFO,
                "127.0.0.1", "Browser", "Deposited $" + request.getAmount() + " into goal: " + goal.getName());

        return mapToResponse(goal);
    }

    @Override
    @Transactional
    public SavingsGoalResponse withdrawFromGoal(UUID userId, UUID goalId, GoalDepositRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", goalId.toString()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to savings goal");
        }

        if (goal.getCurrentAmount().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance in savings vault. Available: $" + goal.getCurrentAmount());
        }

        // Add money back to user wallet
        WalletDepositRequest depositReq = new WalletDepositRequest();
        depositReq.setAmount(request.getAmount());
        depositReq.setDescription("Withdrawal from savings goal: " + goal.getName());
        depositReq.setCategory("Savings Vault Withdrawal");
        walletService.deposit(userId, depositReq);

        // Update goal balance
        BigDecimal newAmount = goal.getCurrentAmount().subtract(request.getAmount());
        goal.setCurrentAmount(newAmount);

        if (goal.getStatus() == GoalStatus.COMPLETED && newAmount.compareTo(goal.getTargetAmount()) < 0) {
            goal.setStatus(GoalStatus.ACTIVE);
        }

        savingsGoalRepository.save(goal);

        auditLogService.logEvent(goal.getUser(), AuditAction.SAVINGS_WITHDRAWAL, AuditCategory.TRANSACTION, AuditSeverity.INFO,
                "127.0.0.1", "Browser", "Withdrew $" + request.getAmount() + " from goal: " + goal.getName());

        return mapToResponse(goal);
    }

    @Override
    @Transactional
    public SavingsGoalResponse toggleAutoRoundup(UUID userId, UUID goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", goalId.toString()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to savings goal");
        }

        boolean willEnable = !Boolean.TRUE.equals(goal.getIsAutoRoundupEnabled());

        if (willEnable) {
            // Disable roundup on other goals
            savingsGoalRepository.findByUserIdAndIsAutoRoundupEnabledTrue(userId)
                    .ifPresent(existing -> {
                        existing.setIsAutoRoundupEnabled(false);
                        savingsGoalRepository.save(existing);
                    });
        }

        goal.setIsAutoRoundupEnabled(willEnable);
        goal = savingsGoalRepository.save(goal);

        return mapToResponse(goal);
    }

    @Override
    @Transactional
    public void deleteGoal(UUID userId, UUID goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", goalId.toString()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to savings goal");
        }

        // Return remaining savings balance to user wallet if > 0
        if (goal.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            WalletDepositRequest depositReq = new WalletDepositRequest();
            depositReq.setAmount(goal.getCurrentAmount());
            depositReq.setDescription("Refund from deleted savings goal: " + goal.getName());
            depositReq.setCategory("Savings Vault Refund");
            walletService.deposit(userId, depositReq);
        }

        savingsGoalRepository.delete(goal);
    }

    private SavingsGoalResponse mapToResponse(SavingsGoal goal) {
        BigDecimal progressPercentage = BigDecimal.ZERO;
        if (goal.getTargetAmount() != null && goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPercentage = goal.getCurrentAmount()
                    .multiply(new BigDecimal("100"))
                    .divide(goal.getTargetAmount(), 1, RoundingMode.HALF_UP);
            if (progressPercentage.compareTo(new BigDecimal("100")) > 0) {
                progressPercentage = new BigDecimal("100.0");
            }
        }

        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .name(goal.getName())
                .category(goal.getCategory())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercentage(progressPercentage)
                .targetDate(goal.getTargetDate())
                .isAutoRoundupEnabled(goal.getIsAutoRoundupEnabled())
                .status(goal.getStatus())
                .color(goal.getColor())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
