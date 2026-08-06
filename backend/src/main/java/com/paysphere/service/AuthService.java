package com.paysphere.service;

import com.paysphere.dto.request.LoginRequest;
import com.paysphere.dto.request.RegisterRequest;
import com.paysphere.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);
}
