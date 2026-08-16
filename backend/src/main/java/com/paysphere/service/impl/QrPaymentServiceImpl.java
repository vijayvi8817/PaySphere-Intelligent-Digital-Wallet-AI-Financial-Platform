package com.paysphere.service.impl;

import com.paysphere.dto.request.QrPaymentRequest;
import com.paysphere.dto.request.TransferRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.QrPaymentResponse;
import com.paysphere.dto.response.TransferResponse;
import com.paysphere.entity.QrPaymentToken;
import com.paysphere.entity.User;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.QrPaymentTokenRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.QrPaymentService;
import com.paysphere.service.TransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QrPaymentServiceImpl implements QrPaymentService {

    private final QrPaymentTokenRepository qrPaymentTokenRepository;
    private final UserRepository userRepository;
    private final TransferService transferService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;
    private static final int DEFAULT_EXPIRY_MINUTES = 30;
    private static final int MAX_EXPIRY_MINUTES = 1440; // 24 hours

    @Override
    @Transactional
    public QrPaymentResponse generateQrToken(UUID userId, QrPaymentRequest request) {
        log.info("Generating QR payment token for userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // Validate expiry
        int expiryMinutes = request.getExpiryMinutes() != null
                ? Math.min(request.getExpiryMinutes(), MAX_EXPIRY_MINUTES)
                : DEFAULT_EXPIRY_MINUTES;
        if (expiryMinutes < 1) {
            throw new BadRequestException("Expiry must be at least 1 minute");
        }

        // Generate secure token
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        QrPaymentToken qrToken = QrPaymentToken.builder()
                .user(user)
                .token(token)
                .amount(request.getAmount())
                .note(request.getNote())
                .singleUse(request.isSingleUse())
                .expiresAt(Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES))
                .build();

        qrToken = qrPaymentTokenRepository.save(qrToken);
        log.info("QR token generated: id={}, expires in {} minutes", qrToken.getId(), expiryMinutes);

        return toResponse(qrToken, user);
    }

    @Override
    @Transactional(readOnly = true)
    public QrPaymentResponse getQrTokenInfo(String token) {
        QrPaymentToken qrToken = qrPaymentTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("QR Payment Token", "token", token));

        // Don't reveal info if expired or used
        if (qrToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This QR code has expired");
        }
        if (qrToken.isUsed()) {
            throw new BadRequestException("This QR code has already been used");
        }

        return toResponse(qrToken, qrToken.getUser());
    }

    @Override
    @Transactional
    public TransferResponse payViaQr(UUID payerUserId, String token, BigDecimal amount, String note) {
        log.info("Processing QR payment: payerUserId={}, token={}", payerUserId, token.substring(0, 8) + "...");

        QrPaymentToken qrToken = qrPaymentTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("QR Payment Token", "token", token));

        // Validations
        if (qrToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("This QR code has expired");
        }
        if (qrToken.isUsed()) {
            throw new BadRequestException("This QR code has already been used");
        }

        // Can't pay yourself
        if (qrToken.getUser().getId().equals(payerUserId)) {
            throw new BadRequestException("You cannot pay yourself via your own QR code");
        }

        // Determine amount — use fixed amount from QR if set, otherwise from request
        BigDecimal paymentAmount;
        if (qrToken.getAmount() != null) {
            paymentAmount = qrToken.getAmount();
        } else if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            paymentAmount = amount;
        } else {
            throw new BadRequestException("Amount is required for this QR code");
        }

        // Execute transfer via existing transfer service
        TransferRequest transferRequest = TransferRequest.builder()
                .recipientEmail(qrToken.getUser().getEmail())
                .amount(paymentAmount)
                .note(note != null ? "[QR] " + note : qrToken.getNote() != null ? "[QR] " + qrToken.getNote() : "[QR Payment]")
                .category("QR Payment")
                .build();

        TransferResponse response = transferService.sendMoney(payerUserId, transferRequest);

        // Mark token as used if single-use
        if (qrToken.isSingleUse()) {
            qrToken.setUsed(true);
            qrPaymentTokenRepository.save(qrToken);
        }

        log.info("QR payment processed successfully: transferId={}", response.getId());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<QrPaymentResponse> getUserQrTokens(UUID userId, int page, int size) {
        Page<QrPaymentToken> tokenPage = qrPaymentTokenRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, Math.min(size, 50)));

        List<QrPaymentResponse> content = tokenPage.getContent().stream()
                .map(t -> toResponse(t, t.getUser()))
                .toList();

        return PagedResponse.<QrPaymentResponse>builder()
                .content(content)
                .page(tokenPage.getNumber())
                .size(tokenPage.getSize())
                .totalElements(tokenPage.getTotalElements())
                .totalPages(tokenPage.getTotalPages())
                .last(tokenPage.isLast())
                .build();
    }

    private QrPaymentResponse toResponse(QrPaymentToken qrToken, User user) {
        // The QR content is a structured string the frontend can encode into a QR image
        String qrContent = "paysphere://pay?token=" + qrToken.getToken();

        return QrPaymentResponse.builder()
                .id(qrToken.getId().toString())
                .token(qrToken.getToken())
                .qrContent(qrContent)
                .amount(qrToken.getAmount())
                .note(qrToken.getNote())
                .singleUse(qrToken.isSingleUse())
                .used(qrToken.isUsed())
                .expiresAt(qrToken.getExpiresAt())
                .createdAt(qrToken.getCreatedAt())
                .recipientName(user.getFullName())
                .recipientEmail(user.getEmail())
                .build();
    }
}
