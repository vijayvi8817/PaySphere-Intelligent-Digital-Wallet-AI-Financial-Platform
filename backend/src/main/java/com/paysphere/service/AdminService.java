package com.paysphere.service;

import com.paysphere.dto.response.AdminStatsResponse;
import com.paysphere.dto.response.AdminUserResponse;
import com.paysphere.dto.response.PagedResponse;

import java.util.UUID;

public interface AdminService {

    AdminStatsResponse getSystemStats();

    PagedResponse<AdminUserResponse> getUsers(int page, int size, String status, String search);

    AdminUserResponse getUserDetail(UUID userId);

    void suspendUser(UUID userId);

    void activateUser(UUID userId);
}
