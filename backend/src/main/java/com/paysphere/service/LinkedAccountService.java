package com.paysphere.service;

import com.paysphere.dto.request.LinkedAccountRequest;
import com.paysphere.dto.response.LinkedAccountResponse;

import java.util.List;
import java.util.UUID;

public interface LinkedAccountService {

    LinkedAccountResponse addAccount(UUID userId, LinkedAccountRequest request);

    List<LinkedAccountResponse> getAccounts(UUID userId);

    LinkedAccountResponse getAccount(UUID userId, UUID accountId);

    LinkedAccountResponse updateAccount(UUID userId, UUID accountId, LinkedAccountRequest request);

    void deleteAccount(UUID userId, UUID accountId);

    LinkedAccountResponse setPrimary(UUID userId, UUID accountId);

    LinkedAccountResponse verifyAccount(UUID userId, UUID accountId);
}
