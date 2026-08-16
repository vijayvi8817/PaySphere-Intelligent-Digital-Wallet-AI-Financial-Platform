package com.paysphere.service;

import com.paysphere.dto.request.CurrencyExchangeRequest;
import com.paysphere.dto.response.CurrencyWalletResponse;
import com.paysphere.dto.response.ExchangeRateResponse;

import java.util.List;

public interface CurrencyExchangeService {
    List<CurrencyWalletResponse> getUserCurrencyWallets(String userId);
    List<ExchangeRateResponse> getLiveExchangeRates();
    CurrencyWalletResponse convertCurrency(String userId, CurrencyExchangeRequest request);
}
