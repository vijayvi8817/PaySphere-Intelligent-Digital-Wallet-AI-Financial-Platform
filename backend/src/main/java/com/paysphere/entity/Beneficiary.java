package com.paysphere.entity;

import com.paysphere.enums.BeneficiaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "beneficiaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id")
    private User beneficiaryUser;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "account_number", length = 20)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 15)
    @Builder.Default
    private BeneficiaryType type = BeneficiaryType.INTERNAL;

    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;
}
