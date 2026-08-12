package com.paysphere.service.impl;

import com.paysphere.dto.request.BeneficiaryRequest;
import com.paysphere.dto.response.BeneficiaryResponse;
import com.paysphere.entity.Beneficiary;
import com.paysphere.entity.User;
import com.paysphere.enums.BeneficiaryType;
import com.paysphere.exception.BadRequestException;
import com.paysphere.exception.DuplicateResourceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.mapper.BeneficiaryMapper;
import com.paysphere.repository.BeneficiaryRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.service.BeneficiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;
    private final BeneficiaryMapper beneficiaryMapper;

    @Override
    @Transactional
    public BeneficiaryResponse addBeneficiary(UUID userId, BeneficiaryRequest request) {
        // Check for duplicate
        if (beneficiaryRepository.existsByUserIdAndEmail(userId, request.getEmail())) {
            throw new DuplicateResourceException("Beneficiary", "email", request.getEmail());
        }

        // Cannot add self as beneficiary
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
        if (currentUser.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Cannot add yourself as a beneficiary");
        }

        // Check if the email belongs to an existing platform user
        User beneficiaryUser = userRepository.findByEmail(request.getEmail()).orElse(null);

        Beneficiary beneficiary = Beneficiary.builder()
                .user(currentUser)
                .beneficiaryUser(beneficiaryUser)
                .nickname(request.getNickname())
                .email(request.getEmail())
                .type(beneficiaryUser != null ? BeneficiaryType.INTERNAL : BeneficiaryType.EXTERNAL)
                .isFavorite(request.getIsFavorite() != null && request.getIsFavorite())
                .build();

        beneficiary = beneficiaryRepository.save(beneficiary);
        log.info("Beneficiary added: userId={}, email={}", userId, request.getEmail());
        return beneficiaryMapper.toResponse(beneficiary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(UUID userId) {
        return beneficiaryRepository.findByUserIdOrderByIsFavoriteDescCreatedAtDesc(userId)
                .stream()
                .map(beneficiaryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getFavoriteBeneficiaries(UUID userId) {
        return beneficiaryRepository.findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(beneficiaryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BeneficiaryResponse toggleFavorite(UUID userId, UUID beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndUserId(beneficiaryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", "id", beneficiaryId.toString()));

        beneficiary.setIsFavorite(!beneficiary.getIsFavorite());
        beneficiary = beneficiaryRepository.save(beneficiary);
        return beneficiaryMapper.toResponse(beneficiary);
    }

    @Override
    @Transactional
    public void deleteBeneficiary(UUID userId, UUID beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndUserId(beneficiaryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", "id", beneficiaryId.toString()));

        beneficiaryRepository.delete(beneficiary);
        log.info("Beneficiary deleted: userId={}, beneficiaryId={}", userId, beneficiaryId);
    }
}
