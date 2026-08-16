package com.paysphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long totalTransfers;
    private BigDecimal totalTransferVolume;
    private long totalDisputes;
    private long openDisputes;
    private long totalWallets;
    private BigDecimal totalWalletBalance;
    private long newUsersThisMonth;
    private long transfersThisMonth;
    private BigDecimal transferVolumeThisMonth;
}
