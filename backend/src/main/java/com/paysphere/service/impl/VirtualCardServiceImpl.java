package com.paysphere.service.impl;

import com.paysphere.dto.request.CardLimitUpdateRequest;
import com.paysphere.dto.request.CardToggleRequest;
import com.paysphere.dto.request.VirtualCardRequest;
import com.paysphere.dto.response.CardSensitiveResponse;
import com.paysphere.dto.response.VirtualCardResponse;
import com.paysphere.entity.User;
import com.paysphere.entity.VirtualCard;
import com.paysphere.enums.AuditAction;
import com.paysphere.enums.AuditCategory;
import com.paysphere.enums.AuditSeverity;
import com.paysphere.enums.CardStatus;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.UserRepository;
import com.paysphere.repository.VirtualCardRepository;
import com.paysphere.service.AuditLogService;
import com.paysphere.service.VirtualCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VirtualCardServiceImpl implements VirtualCardService {

    private final VirtualCardRepository virtualCardRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public VirtualCardResponse issueCard(UUID userId, VirtualCardRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // Limit user to 5 active virtual cards
        List<VirtualCard> existing = virtualCardRepository.findByUserIdAndStatus(userId, CardStatus.ACTIVE);
        if (existing.size() >= 5) {
            throw new BadRequestException("Maximum active card limit reached (5 cards)");
        }

        String rawCardNumber = generateCardNumber(request.getCardNetwork().name());
        String maskedCardNumber = "**** **** **** " + rawCardNumber.substring(12);
        String cvv = String.format("%03d", ThreadLocalRandom.current().nextInt(100, 1000));

        LocalDate now = LocalDate.now();
        int expiryMonth = now.getMonthValue();
        int expiryYear = (now.getYear() + 4) % 100; // 4 year expiry

        VirtualCard card = VirtualCard.builder()
                .user(user)
                .cardNumberMasked(maskedCardNumber)
                .cardNumberEncrypted(rawCardNumber) // Simulated encryption
                .cardholderName(request.getCardholderName().toUpperCase())
                .expiryMonth(expiryMonth)
                .expiryYear(expiryYear)
                .cvv(cvv)
                .cardType(request.getCardType())
                .cardNetwork(request.getCardNetwork())
                .dailyLimit(request.getDailyLimit() != null ? request.getDailyLimit() : new BigDecimal("1000.00"))
                .monthlyLimit(request.getMonthlyLimit() != null ? request.getMonthlyLimit() : new BigDecimal("5000.00"))
                .spentThisMonth(BigDecimal.ZERO)
                .isFrozen(false)
                .onlinePaymentsEnabled(true)
                .internationalPaymentsEnabled(false)
                .atmWithdrawalsEnabled(true)
                .pin(request.getPin() != null ? request.getPin() : "1234")
                .status(CardStatus.ACTIVE)
                .build();

        card = virtualCardRepository.save(card);

        auditLogService.logEvent(user, AuditAction.CARD_ISSUED, AuditCategory.CARD, AuditSeverity.INFO,
                "127.0.0.1", "Browser", "Issued new " + card.getCardType() + " card ending in " + rawCardNumber.substring(12));

        return mapToResponse(card);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VirtualCardResponse> getUserCards(UUID userId) {
        return virtualCardRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VirtualCardResponse getCardDetails(UUID userId, UUID cardId) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));
        return mapToResponse(card);
    }

    @Override
    @Transactional
    public VirtualCardResponse toggleFreezeCard(UUID userId, UUID cardId) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));

        boolean newFrozenState = !card.getIsFrozen();
        card.setIsFrozen(newFrozenState);
        card = virtualCardRepository.save(card);

        AuditAction action = newFrozenState ? AuditAction.CARD_FROZEN : AuditAction.CARD_UNFROZEN;
        auditLogService.logEvent(card.getUser(), action, AuditCategory.CARD, AuditSeverity.WARNING,
                "127.0.0.1", "Browser", (newFrozenState ? "Froze" : "Unfroze") + " card ending in " + card.getCardNumberMasked().substring(15));

        return mapToResponse(card);
    }

    @Override
    @Transactional
    public VirtualCardResponse updateLimits(UUID userId, UUID cardId, CardLimitUpdateRequest request) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));

        card.setDailyLimit(request.getDailyLimit());
        card.setMonthlyLimit(request.getMonthlyLimit());
        card = virtualCardRepository.save(card);

        auditLogService.logEvent(card.getUser(), AuditAction.CARD_LIMIT_UPDATED, AuditCategory.CARD, AuditSeverity.INFO,
                "127.0.0.1", "Browser", "Updated limits for card ending in " + card.getCardNumberMasked().substring(15));

        return mapToResponse(card);
    }

    @Override
    @Transactional
    public VirtualCardResponse toggleSettings(UUID userId, UUID cardId, CardToggleRequest request) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));

        if (request.getOnlinePaymentsEnabled() != null) {
            card.setOnlinePaymentsEnabled(request.getOnlinePaymentsEnabled());
        }
        if (request.getInternationalPaymentsEnabled() != null) {
            card.setInternationalPaymentsEnabled(request.getInternationalPaymentsEnabled());
        }
        if (request.getAtmWithdrawalsEnabled() != null) {
            card.setAtmWithdrawalsEnabled(request.getAtmWithdrawalsEnabled());
        }

        card = virtualCardRepository.save(card);
        return mapToResponse(card);
    }

    @Override
    @Transactional(readOnly = true)
    public CardSensitiveResponse revealCardDetails(UUID userId, UUID cardId) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));

        if (Boolean.TRUE.equals(card.getIsFrozen())) {
            throw new BadRequestException("Cannot reveal details of a frozen card");
        }

        auditLogService.logEvent(card.getUser(), AuditAction.CARD_DETAILS_VIEWED, AuditCategory.SECURITY, AuditSeverity.WARNING,
                "127.0.0.1", "Browser", "Viewed sensitive card credentials for card ending in " + card.getCardNumberMasked().substring(15));

        return CardSensitiveResponse.builder()
                .cardId(card.getId())
                .fullCardNumber(card.getCardNumberEncrypted())
                .cvv(card.getCvv())
                .expiryMonth(card.getExpiryMonth())
                .expiryYear(card.getExpiryYear())
                .cardholderName(card.getCardholderName())
                .build();
    }

    @Override
    @Transactional
    public VirtualCardResponse setCardPin(UUID userId, UUID cardId, String pin) {
        VirtualCard card = virtualCardRepository.findByIdAndUserId(cardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("VirtualCard", "id", cardId.toString()));

        if (pin == null || !pin.matches("\\d{4}")) {
            throw new BadRequestException("PIN must be a 4-digit number");
        }

        card.setPin(pin);
        card = virtualCardRepository.save(card);
        return mapToResponse(card);
    }

    private String generateCardNumber(String network) {
        String prefix = "4532"; // Visa BIN
        if ("MASTERCARD".equalsIgnoreCase(network)) {
            prefix = "5412"; // Mastercard BIN
        }
        long randomDigits = ThreadLocalRandom.current().nextLong(100_000_000_000L, 999_999_999_999L);
        return prefix + String.valueOf(randomDigits);
    }

    private VirtualCardResponse mapToResponse(VirtualCard card) {
        return VirtualCardResponse.builder()
                .id(card.getId())
                .userId(card.getUser().getId())
                .cardNumberMasked(card.getCardNumberMasked())
                .cardholderName(card.getCardholderName())
                .expiryMonth(card.getExpiryMonth())
                .expiryYear(card.getExpiryYear())
                .cardType(card.getCardType())
                .cardNetwork(card.getCardNetwork())
                .dailyLimit(card.getDailyLimit())
                .monthlyLimit(card.getMonthlyLimit())
                .spentThisMonth(card.getSpentThisMonth())
                .isFrozen(card.getIsFrozen())
                .onlinePaymentsEnabled(card.getOnlinePaymentsEnabled())
                .internationalPaymentsEnabled(card.getInternationalPaymentsEnabled())
                .atmWithdrawalsEnabled(card.getAtmWithdrawalsEnabled())
                .status(card.getStatus())
                .createdAt(card.getCreatedAt())
                .build();
    }
}
