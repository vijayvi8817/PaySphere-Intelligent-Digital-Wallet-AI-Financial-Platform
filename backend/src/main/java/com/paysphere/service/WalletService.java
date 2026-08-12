package com.paysphere.service;

import com.paysphere.dto.request.WalletDepositRequest;
import com.paysphere.dto.request.WalletWithdrawRequest;
import com.paysphere.dto.response.PagedResponse;
import com.paysphere.dto.response.WalletDashboardResponse;
import com.paysphere.dto.response.WalletResponse;
import com.paysphere.dto.response.WalletStatementResponse;
import com.paysphere.dto.response.WalletTransactionResponse;

import java.util.UUID;

public interface WalletService {

    WalletResponse getWallet(UUID userId);

    WalletResponse deposit(UUID userId, WalletDepositRequest request);

    WalletResponse withdraw(UUID userId, WalletWithdrawRequest request);

    WalletResponse freezeWallet(UUID userId);

    WalletResponse unfreezeWallet(UUID userId);

    PagedResponse<WalletTransactionResponse> getTransactions(UUID userId, int page, int size, String type);

    WalletDashboardResponse getDashboard(UUID userId);

    WalletStatementResponse getStatement(UUID userId, int month, int year);
}
