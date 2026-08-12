package com.paysphere.service.impl;

import com.paysphere.dto.request.LinkedAccountRequest;
import com.paysphere.dto.response.LinkedAccountResponse;
import com.paysphere.entity.LinkedAccount;
import com.paysphere.entity.User;
import com.paysphere.enums.LinkedAccountStatus;
import com.paysphere.enums.LinkedAccountType;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.DuplicateResourceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.LinkedAccountMapper;
import com.paysphere.repository.LinkedAccountRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.LinkedAccountService;
import com.paysphere.service.NotificationService;
import com.paysphere.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LinkedAccountServiceImpl implements LinkedAccountService {

    private static final int MAX_LINKED_ACCOUNTS = 5;

    private final LinkedAccountRepository linkedAccountRepository;
    private final UserRepository userRepository;
    private final LinkedAccountMapper linkedAccountMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LinkedAccountResponse addAccount(UUID userId, LinkedAccountRequest request) {
        log.info("Adding linked account for userId={}, bank={}", userId, request.getBankName());

        // Check max limit
        long count = linkedAccountRepository.countByUserId(userId);
        if (count >= MAX_LINKED_ACCOUNTS) {
            throw new BadRequestException("Maximum of " + MAX_LINKED_ACCOUNTS + " linked accounts allowed");
        }

        // Check for duplicates
        if (linkedAccountRepository.existsByUserIdAndBankNameAndAccountNumber(
                userId, request.getBankName(), request.getAccountNumber())) {
            throw new DuplicateResourceException("LinkedAccount", "accountNumber", request.getAccountNumber());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        LinkedAccountType accountType = LinkedAccountType.CHECKING;
        if (request.getAccountType() != null) {
            try {
                accountType = LinkedAccountType.valueOf(request.getAccountType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid account type: " + request.getAccountType());
            }
        }

        boolean isPrimary = Boolean.TRUE.equals(request.getIsPrimary());
        if (isPrimary) {
            // Unset existing primary
            linkedAccountRepository.findByUserIdAndIsPrimaryTrue(userId)
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        linkedAccountRepository.save(existing);
                    });
        }

        // If this is the first account, make it primary
        if (count == 0) {
            isPrimary = true;
        }

        LinkedAccount account = LinkedAccount.builder()
                .user(user)
                .accountName(request.getAccountName())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .routingNumber(request.getRoutingNumber())
                .accountType(accountType)
                .status(LinkedAccountStatus.PENDING)
                .isPrimary(isPrimary)
                .build();

        account = linkedAccountRepository.save(account);

        notificationService.createNotification(userId, NotificationType.ACCOUNT_LINKED,
                "Bank Account Linked",
                "Your " + request.getBankName() + " account ending in ****" +
                        request.getAccountNumber().substring(request.getAccountNumber().length() - 4) +
                        " has been linked and is pending verification.",
                null);

        log.info("Linked account created: id={}, bank={}", account.getId(), request.getBankName());
        return linkedAccountMapper.toResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LinkedAccountResponse> getAccounts(UUID userId) {
        return linkedAccountRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(linkedAccountMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LinkedAccountResponse getAccount(UUID userId, UUID accountId) {
        LinkedAccount account = linkedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("LinkedAccount", "id", accountId.toString()));
        return linkedAccountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public LinkedAccountResponse updateAccount(UUID userId, UUID accountId, LinkedAccountRequest request) {
        LinkedAccount account = linkedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("LinkedAccount", "id", accountId.toString()));

        if (request.getAccountName() != null) {
            account.setAccountName(request.getAccountName());
        }
        if (request.getRoutingNumber() != null) {
            account.setRoutingNumber(request.getRoutingNumber());
        }
        if (request.getAccountType() != null) {
            try {
                account.setAccountType(LinkedAccountType.valueOf(request.getAccountType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid account type: " + request.getAccountType());
            }
        }

        account = linkedAccountRepository.save(account);
        return linkedAccountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId, UUID accountId) {
        LinkedAccount account = linkedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("LinkedAccount", "id", accountId.toString()));

        linkedAccountRepository.delete(account);
        log.info("Linked account deleted: id={}, userId={}", accountId, userId);

        // If this was primary, promote the next account
        if (account.getIsPrimary()) {
            List<LinkedAccount> remaining = linkedAccountRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsPrimary(true);
                linkedAccountRepository.save(remaining.get(0));
            }
        }
    }

    @Override
    @Transactional
    public LinkedAccountResponse setPrimary(UUID userId, UUID accountId) {
        LinkedAccount account = linkedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("LinkedAccount", "id", accountId.toString()));

        // Unset existing primary
        linkedAccountRepository.findByUserIdAndIsPrimaryTrue(userId)
                .ifPresent(existing -> {
                    existing.setIsPrimary(false);
                    linkedAccountRepository.save(existing);
                });

        account.setIsPrimary(true);
        account = linkedAccountRepository.save(account);
        return linkedAccountMapper.toResponse(account);
    }

    @Override
    @Transactional
    public LinkedAccountResponse verifyAccount(UUID userId, UUID accountId) {
        LinkedAccount account = linkedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("LinkedAccount", "id", accountId.toString()));

        if (account.getStatus() == LinkedAccountStatus.VERIFIED) {
            throw new BadRequestException("Account is already verified");
        }

        account.setStatus(LinkedAccountStatus.VERIFIED);
        account = linkedAccountRepository.save(account);

        notificationService.createNotification(userId, NotificationType.ACCOUNT_VERIFIED,
                "Account Verified",
                "Your " + account.getBankName() + " account has been successfully verified.",
                null);

        return linkedAccountMapper.toResponse(account);
    }
}
