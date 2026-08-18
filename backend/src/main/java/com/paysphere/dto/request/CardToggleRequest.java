package com.paysphere.dto.request;

import lombok.Data;

@Data
public class CardToggleRequest {
    private Boolean onlinePaymentsEnabled;
    private Boolean internationalPaymentsEnabled;
    private Boolean atmWithdrawalsEnabled;
}
