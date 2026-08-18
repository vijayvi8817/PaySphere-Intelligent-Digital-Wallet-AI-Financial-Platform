package com.paysphere.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CardSensitiveResponse {
    private UUID cardId;
    private String fullCardNumber;
    private String cvv;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cardholderName;
}
