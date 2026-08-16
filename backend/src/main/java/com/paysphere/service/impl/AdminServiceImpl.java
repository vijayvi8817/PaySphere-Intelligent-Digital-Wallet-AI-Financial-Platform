package com.paysphere.service.impl;

import com.paysphere.dto.response.AdminStatsResponse;
import com.paysphere.dto.response.AdminUserResponse;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.entity.User;
import com.paysphere.entity.Wallet;
import com.paysphere.enums.DisputeStatus;
import com.paysphere.enums.UserStatus;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.DisputeRepository;
import com.paysphere.repository.TransferRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.service.AdminService;
import com.paysphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransferRepository transferRepository;
    private final DisputeRepository disputeRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getSystemStats() {
        log.info("Generating admin system statistics");

        long totalUsers = userRepository.count();
        List<User> allUsers = userRepository.findAll();

        long activeUsers = allUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .count();
        long suspendedUsers = allUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.SUSPENDED)
                .count();

        long totalTransfers = transferRepository.count();
        long totalDisputes = disputeRepository.count();
        long openDisputes = disputeRepository.countByStatus(DisputeStatus.OPEN)
                + disputeRepository.countByStatus(DisputeStatus.UNDER_REVIEW);

        List<Wallet> allWallets = walletRepository.findAll();
        long totalWallets = allWallets.size();
        BigDecimal totalWalletBalance = allWallets.stream()
                .map(Wallet::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // This month stats
        Instant monthStart = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant now = Instant.now();

        long newUsersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(monthStart))
                .count();

        // Transfer volume — sum all transfer amounts
        BigDecimal totalTransferVolume = BigDecimal.ZERO;
        BigDecimal transferVolumeThisMonth = BigDecimal.ZERO;

        // Use a simplified approach for aggregate stats
        var allTransfers = transferRepository.findAll();
        for (var t : allTransfers) {
            totalTransferVolume = totalTransferVolume.add(t.getAmount());
            if (t.getCreatedAt() != null && t.getCreatedAt().isAfter(monthStart)) {
                transferVolumeThisMonth = transferVolumeThisMonth.add(t.getAmount());
            }
        }

        long transfersThisMonth = allTransfers.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(monthStart))
                .count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .totalTransfers(totalTransfers)
                .totalTransferVolume(totalTransferVolume)
                .totalDisputes(totalDisputes)
                .openDisputes(openDisputes)
                .totalWallets(totalWallets)
                .totalWalletBalance(totalWalletBalance)
                .newUsersThisMonth(newUsersThisMonth)
                .transfersThisMonth(transfersThisMonth)
                .transferVolumeThisMonth(transferVolumeThisMonth)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> getUsers(int page, int size, String status, String search) {
        // Simple approach: get all users and filter in memory
        // In production, use Specification or Criteria API for SQL-level filtering
        Page<User> userPage = userRepository.findAll(
                PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt")));

        List<AdminUserResponse> content = userPage.getContent().stream()
                .filter(u -> {
                    if (status != null && !status.isBlank()) {
                        try {
                            return u.getStatus() == UserStatus.valueOf(status.toUpperCase());
                        } catch (IllegalArgumentException e) {
                            return true;
                        }
                    }
                    return true;
                })
                .filter(u -> {
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        return u.getEmail().toLowerCase().contains(s) ||
                                u.getFirstName().toLowerCase().contains(s) ||
                                u.getLastName().toLowerCase().contains(s);
                    }
                    return true;
                })
                .map(this::mapToAdminUserResponse)
                .toList();

        return PagedResponse.<AdminUserResponse>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
        return mapToAdminUserResponse(user);
    }

    @Override
    @Transactional
    public void suspendUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("User is already suspended");
        }

        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
        log.info("User suspended: userId={}", userId);

        notificationService.createNotification(
                userId,
                com.paysphere.enums.NotificationType.SYSTEM,
                "Account Suspended",
                "Your account has been suspended by an administrator. Please contact support for details.",
                userId.toString()
        );
    }

    @Override
    @Transactional
    public void activateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("User is already active");
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User activated: userId={}", userId);

        notificationService.createNotification(
                userId,
                com.paysphere.enums.NotificationType.SYSTEM,
                "Account Activated",
                "Your account has been activated. You can now access all PaySphere features.",
                userId.toString()
        );
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        BigDecimal walletBalance = BigDecimal.ZERO;
        var wallet = walletRepository.findByUserId(user.getId());
        if (wallet.isPresent()) {
            walletBalance = wallet.get().getBalance();
        }

        long totalSent = transferRepository.findBySenderUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(0, 1)).getTotalElements();
        long totalReceived = transferRepository.findByReceiverUserIdOrderByCreatedAtDesc(
                user.getId(), PageRequest.of(0, 1)).getTotalElements();
        long activeDisputes = disputeRepository.countByUserIdAndStatus(user.getId(), DisputeStatus.OPEN)
                + disputeRepository.countByUserIdAndStatus(user.getId(), DisputeStatus.UNDER_REVIEW);

        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        return AdminUserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .status(user.getStatus())
                .kycStatus(user.getKycStatus())
                .roles(roles)
                .walletBalance(walletBalance)
                .totalTransfersSent(totalSent)
                .totalTransfersReceived(totalReceived)
                .activeDisputes(activeDisputes)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
