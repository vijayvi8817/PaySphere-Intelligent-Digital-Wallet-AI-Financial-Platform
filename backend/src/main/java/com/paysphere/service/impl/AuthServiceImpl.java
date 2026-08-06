package com.paysphere.service.impl;

import com.paysphere.dto.request.LoginRequest;
import com.paysphere.dto.request.RegisterRequest;
import com.paysphere.dto.response.AuthResponse;
import com.paysphere.entity.Role;
import com.paysphere.entity.User;
import com.paysphere.enums.RoleName;
import com.paysphere.exception.DuplicateResourceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.exception.UnauthorizedException;
import com.paysphere.repository.RoleRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.security.CustomUserDetails;
import com.paysphere.security.JwtTokenProvider;
import com.paysphere.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:token:";

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", RoleName.ROLE_USER.name()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // Authenticate immediately after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return buildAuthResponse(authentication);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Processing login for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("User logged in successfully: {}", request.getEmail());
        return buildAuthResponse(authentication);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Processing token refresh");

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Check if token is blacklisted
        Boolean isBlacklisted = redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + refreshToken);
        if (Boolean.TRUE.equals(isBlacklisted)) {
            throw new UnauthorizedException("Token has been revoked");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateAccessTokenFromEmail(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Reuse the same refresh token
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    /**
     * Blacklists the given token in Redis so it cannot be reused.
     */
    public void logout(String accessToken) {
        log.info("Processing logout — blacklisting token");
        redisTemplate.opsForValue().set(
                TOKEN_BLACKLIST_PREFIX + accessToken,
                "revoked",
                jwtTokenProvider.getJwtExpirationMs(),
                TimeUnit.MILLISECONDS
        );
    }

    private AuthResponse buildAuthResponse(Authentication authentication) {
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Fetch the full user entity for role names
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getEmail()));

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }
}
