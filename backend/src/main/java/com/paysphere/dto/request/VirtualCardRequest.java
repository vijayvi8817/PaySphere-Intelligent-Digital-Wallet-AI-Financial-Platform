package com.paysphere.dto.request;

import com.paysphere.enums.CardNetwork;
import com.paysphere.enums.CardType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VirtualCardRequest {

    @NotBlank(message = "Cardholder name is required")
    private String cardholderName;

    private CardType cardType = CardType.VIRTUAL;

    private CardNetwork cardNetwork = CardNetwork.VISA;

    @DecimalMin(value = "10.00", message = "Daily limit must be at least 10.00")
    private BigDecimal dailyLimit = new BigDecimal("1000.00");

    @DecimalMin(value = "10.00", message = "Monthly limit must be at least 10.00")
    private BigDecimal monthlyLimit = new BigDecimal("5000.00");

    private String pin = "1234";
}
