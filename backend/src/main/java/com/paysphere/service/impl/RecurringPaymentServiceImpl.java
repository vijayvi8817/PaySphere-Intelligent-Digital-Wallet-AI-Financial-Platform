package com.paysphere.service.impl;

import com.paysphere.dto.request.RecurringPaymentRequest;
import com.paysphere.dto.request.TransferRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.RecurringPaymentResponse;
import com.paysphere.entity.RecurringPayment;
import com.paysphere.entity.User;
import com.paysphere.enums.RecurringPaymentFrequency;
import com.paysphere.enums.RecurringPaymentStatus;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.RecurringPaymentMapper;
import com.paysphere.repository.RecurringPaymentRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.NotificationService;
import com.paysphere.service.RecurringPaymentService;
import com.paysphere.service.TransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringPaymentServiceImpl implements RecurringPaymentService {

    private final RecurringPaymentRepository recurringPaymentRepository;
    private final UserRepository userRepository;
    private final TransferService transferService;
    private final NotificationService notificationService;
    private final RecurringPaymentMapper recurringPaymentMapper;

    @Override
    @Transactional
    public RecurringPaymentResponse create(UUID userId, RecurringPaymentRequest request) {
        log.info("Creating recurring payment for userId={}, recipient={}, frequency={}",
                userId, request.getRecipientEmail(), request.getFrequency());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // Validate recipient exists
        if (!userRepository.existsByEmailIgnoreCase(request.getRecipientEmail().trim())) {
            throw new BadRequestException("Recipient not found: " + request.getRecipientEmail());
        }

        // Cannot send to yourself
        if (user.getEmail().equalsIgnoreCase(request.getRecipientEmail().trim())) {
            throw new BadRequestException("Cannot create a recurring payment to yourself");
        }

        // Parse frequency
        RecurringPaymentFrequency frequency;
        try {
            frequency = RecurringPaymentFrequency.valueOf(request.getFrequency().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid frequency. Allowed: DAILY, WEEKLY, BIWEEKLY, MONTHLY");
        }

        // Determine start date
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }

        // Validate end date
        if (request.getEndDate() != null && request.getEndDate().isBefore(startDate)) {
            throw new BadRequestException("End date must be after start date");
        }

        // Limit active recurring payments per user
        long activeCount = recurringPaymentRepository.countByUserIdAndStatus(userId, RecurringPaymentStatus.ACTIVE);
        if (activeCount >= 20) {
            throw new BadRequestException("Maximum 20 active recurring payments allowed");
        }

        RecurringPayment payment = RecurringPayment.builder()
                .user(user)
                .recipientEmail(request.getRecipientEmail().trim().toLowerCase())
                .amount(request.getAmount())
                .frequency(frequency)
                .note(request.getNote())
                .category(request.getCategory())
                .startDate(startDate)
                .nextExecution(startDate)
                .endDate(request.getEndDate())
                .maxExecutions(request.getMaxExecutions())
                .build();

        payment = recurringPaymentRepository.save(payment);
        log.info("Recurring payment created: id={}, frequency={}", payment.getId(), frequency);

        return recurringPaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public RecurringPaymentResponse getById(UUID userId, UUID paymentId) {
        RecurringPayment payment = recurringPaymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringPayment", "id", paymentId.toString()));
        return recurringPaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RecurringPaymentResponse> getAll(UUID userId, int page, int size) {
        Page<RecurringPayment> paymentPage = recurringPaymentRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, Math.min(size, 50)));

        List<RecurringPaymentResponse> content = paymentPage.getContent().stream()
                .map(recurringPaymentMapper::toResponse)
                .toList();

        return PagedResponse.<RecurringPaymentResponse>builder()
                .content(content)
                .page(paymentPage.getNumber())
                .size(paymentPage.getSize())
                .totalElements(paymentPage.getTotalElements())
                .totalPages(paymentPage.getTotalPages())
                .last(paymentPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public RecurringPaymentResponse pause(UUID userId, UUID paymentId) {
        RecurringPayment payment = recurringPaymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringPayment", "id", paymentId.toString()));

        if (payment.getStatus() != RecurringPaymentStatus.ACTIVE) {
            throw new BadRequestException("Only ACTIVE recurring payments can be paused");
        }

        payment.setStatus(RecurringPaymentStatus.PAUSED);
        recurringPaymentRepository.save(payment);
        log.info("Recurring payment paused: id={}", paymentId);

        return recurringPaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public RecurringPaymentResponse resume(UUID userId, UUID paymentId) {
        RecurringPayment payment = recurringPaymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringPayment", "id", paymentId.toString()));

        if (payment.getStatus() != RecurringPaymentStatus.PAUSED) {
            throw new BadRequestException("Only PAUSED recurring payments can be resumed");
        }

        // If next execution is in the past, move it to today
        if (payment.getNextExecution().isBefore(LocalDate.now())) {
            payment.setNextExecution(LocalDate.now());
        }

        payment.setStatus(RecurringPaymentStatus.ACTIVE);
        recurringPaymentRepository.save(payment);
        log.info("Recurring payment resumed: id={}", paymentId);

        return recurringPaymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public void cancel(UUID userId, UUID paymentId) {
        RecurringPayment payment = recurringPaymentRepository.findByIdAndUserId(paymentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringPayment", "id", paymentId.toString()));

        if (payment.getStatus() == RecurringPaymentStatus.CANCELLED) {
            throw new BadRequestException("Recurring payment is already cancelled");
        }

        payment.setStatus(RecurringPaymentStatus.CANCELLED);
        recurringPaymentRepository.save(payment);
        log.info("Recurring payment cancelled: id={}", paymentId);
    }

    /**
     * Scheduled job that runs every hour to process due recurring payments.
     * Processes all ACTIVE payments whose nextExecution date is today or earlier.
     */
    @Override
    @Scheduled(cron = "0 0 * * * *") // Every hour at :00
    @Transactional
    public void processDuePayments() {
        LocalDate today = LocalDate.now();
        List<RecurringPayment> duePayments = recurringPaymentRepository
                .findDuePayments(RecurringPaymentStatus.ACTIVE, today);

        if (duePayments.isEmpty()) {
            return;
        }

        log.info("Processing {} due recurring payments", duePayments.size());

        for (RecurringPayment payment : duePayments) {
            try {
                executePayment(payment);
            } catch (Exception e) {
                log.error("Failed to execute recurring payment id={}: {}", payment.getId(), e.getMessage());

                // Notify user of failure
                notificationService.createNotification(
                        payment.getUser().getId(),
                        com.paysphere.enums.NotificationType.SYSTEM,
                        "Recurring Payment Failed",
                        "Your recurring payment of $" + payment.getAmount() +
                                " to " + payment.getRecipientEmail() + " failed: " + e.getMessage(),
                        payment.getId().toString()
                );
            }
        }
    }

    private void executePayment(RecurringPayment payment) {
        UUID userId = payment.getUser().getId();

        // Execute the transfer using existing transfer service
        TransferRequest transferRequest = TransferRequest.builder()
                .recipientEmail(payment.getRecipientEmail())
                .amount(payment.getAmount())
                .note(payment.getNote() != null
                        ? "[Recurring] " + payment.getNote()
                        : "[Recurring Payment]")
                .category(payment.getCategory())
                .build();

        transferService.sendMoney(userId, transferRequest);

        // Update recurring payment state
        payment.setLastExecuted(Instant.now());
        payment.setTotalExecuted(payment.getTotalExecuted() + 1);
        payment.setNextExecution(calculateNextExecution(payment.getNextExecution(), payment.getFrequency()));

        // Check completion conditions
        boolean completed = false;
        if (payment.getMaxExecutions() != null && payment.getTotalExecuted() >= payment.getMaxExecutions()) {
            payment.setStatus(RecurringPaymentStatus.COMPLETED);
            completed = true;
        }
        if (payment.getEndDate() != null && payment.getNextExecution().isAfter(payment.getEndDate())) {
            payment.setStatus(RecurringPaymentStatus.COMPLETED);
            completed = true;
        }

        recurringPaymentRepository.save(payment);

        log.info("Recurring payment executed: id={}, total={}, next={}",
                payment.getId(), payment.getTotalExecuted(), payment.getNextExecution());

        // Notify user of successful recurring payment execution
        notificationService.createNotification(
                userId,
                com.paysphere.enums.NotificationType.TRANSFER_SENT,
                "Recurring Payment Processed",
                "Your recurring payment of $" + payment.getAmount() +
                        " to " + payment.getRecipientEmail() + " was processed successfully." +
                        (completed ? " This was the final payment." : " Next: " + payment.getNextExecution()),
                payment.getId().toString()
        );
    }

    private LocalDate calculateNextExecution(LocalDate current, RecurringPaymentFrequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case BIWEEKLY -> current.plusWeeks(2);
            case MONTHLY -> current.plusMonths(1);
        };
    }
}
