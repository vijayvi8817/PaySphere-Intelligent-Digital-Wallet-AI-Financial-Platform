package com.paysphere.service;

import com.paysphere.dto.request.UpdateProfileRequest;
import com.paysphere.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {

    UserResponse getCurrentUser(String email);

    UserResponse getUserById(UUID userId);

    UserResponse updateProfile(String email, UpdateProfileRequest request);
}
