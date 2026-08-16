package com.paysphere.service.impl;

import com.paysphere.dto.request.CurrencyExchangeRequest;
import com.paysphere.dto.response.CurrencyWalletResponse;
import com.paysphere.dto.response.ExchangeRateResponse;
import com.paysphere.entity.CurrencyWallet;
import com.paysphere.entity.ExchangeRate;
import com.paysphere.entity.User;
import com.paysphere.entity.Wallet;
import com.paysphere.enums.NotificationType;
import com.paysphere.exception.InsufficientBalanceException;
import com.paysphere.exception.ResourceNotFoundException;
import com.paysphere.repository.CurrencyWalletRepository;
import com.paysphere.repository.ExchangeRateRepository;
import com.paysphere.repository.UserRepository;
import com.paysphere.repository.WalletRepository;
import com.paysphere.service.CurrencyExchangeService;
import com.paysphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyExchangeServiceImpl implements CurrencyExchangeService {

    private final CurrencyWalletRepository currencyWalletRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final Map<String, String> CURRENCY_NAMES = Map.of(
            "USD", "US Dollar",
            "EUR", "Euro",
            "GBP", "British Pound",
            "JPY", "Japanese Yen",
            "CAD", "Canadian Dollar",
            "INR", "Indian Rupee",
            "AUD", "Australian Dollar"
    );

    private static final Map<String, String> CURRENCY_SYMBOLS = Map.of(
            "USD", "$",
            "EUR", "€",
            "GBP", "£",
            "JPY", "¥",
            "CAD", "CA$",
            "INR", "₹",
            "AUD", "A$"
    );

    @Override
    @Transactional(readOnly = true)
    public List<CurrencyWalletResponse> getUserCurrencyWallets(String userId) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Wallet primaryWallet = walletRepository.findByUserId(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

        List<CurrencyWallet> currencyWallets = currencyWalletRepository.findByUserId(userUuid);

        List<CurrencyWalletResponse> responses = new ArrayList<>();

        // Add primary USD wallet
        responses.add(CurrencyWalletResponse.builder()
                .id(primaryWallet.getId() != null ? primaryWallet.getId().toString() : null)
                .currency("USD")
                .balance(primaryWallet.getBalance())
                .symbol("$")
                .currencyName("US Dollar (Primary)")
                .build());

        // Add foreign currency wallets
        for (CurrencyWallet cw : currencyWallets) {
            if (!"USD".equalsIgnoreCase(cw.getCurrency())) {
                responses.add(mapToWalletResponse(cw));
            }
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRateResponse> getLiveExchangeRates() {
        return exchangeRateRepository.findAll().stream()
                .map(this::mapToRateResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CurrencyWalletResponse convertCurrency(String userId, CurrencyExchangeRequest request) {
        UUID userUuid = UUID.fromString(userId);
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String fromCurr = request.getFromCurrency().toUpperCase();
        String toCurr = request.getToCurrency().toUpperCase();
        BigDecimal amount = request.getAmount();

        if (fromCurr.equals(toCurr)) {
            throw new IllegalArgumentException("From and To currencies must be different");
        }

        ExchangeRate rate = exchangeRateRepository.findByBaseCurrencyAndTargetCurrency(fromCurr, toCurr)
                .orElseThrow(() -> new ResourceNotFoundException("ExchangeRate", "pair", fromCurr + "_" + toCurr));

        // Deduct from source currency balance
        if ("USD".equals(fromCurr)) {
            Wallet usdWallet = walletRepository.findByUserId(userUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));

            if (usdWallet.getBalance().compareTo(amount) < 0) {
                throw new InsufficientBalanceException("Insufficient USD balance. Required: $" + amount + ", Available: $" + usdWallet.getBalance());
            }
            usdWallet.setBalance(usdWallet.getBalance().subtract(amount));
            walletRepository.save(usdWallet);
        } else {
            CurrencyWallet sourceWallet = currencyWalletRepository.findByUserIdAndCurrency(userUuid, fromCurr)
                    .orElseThrow(() -> new InsufficientBalanceException("You do not hold a wallet in " + fromCurr));

            if (sourceWallet.getBalance().compareTo(amount) < 0) {
                throw new InsufficientBalanceException("Insufficient " + fromCurr + " balance. Required: " + amount + ", Available: " + sourceWallet.getBalance());
            }
            sourceWallet.setBalance(sourceWallet.getBalance().subtract(amount));
            currencyWalletRepository.save(sourceWallet);
        }

        // Calculate converted amount with fee deduction
        BigDecimal grossConverted = amount.multiply(rate.getRate());
        BigDecimal feeFactor = BigDecimal.ONE.subtract(rate.getFeePercentage().divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP));
        BigDecimal netConverted = grossConverted.multiply(feeFactor).setScale(2, RoundingMode.HALF_UP);

        // Credit target currency wallet
        if ("USD".equals(toCurr)) {
            Wallet usdWallet = walletRepository.findByUserId(userUuid)
                    .orElseThrow(() -> new ResourceNotFoundException("Wallet", "userId", userId));
            usdWallet.setBalance(usdWallet.getBalance().add(netConverted));
            walletRepository.save(usdWallet);

            notificationService.createNotification(
                    userUuid,
                    NotificationType.SYSTEM,
                    "Currency Converted",
                    "Successfully converted " + amount + " " + fromCurr + " to $" + netConverted + " USD.",
                    usdWallet.getId() != null ? usdWallet.getId().toString() : null
            );

            return CurrencyWalletResponse.builder()
                    .id(usdWallet.getId() != null ? usdWallet.getId().toString() : null)
                    .currency("USD")
                    .balance(usdWallet.getBalance())
                    .symbol("$")
                    .currencyName("US Dollar (Primary)")
                    .build();
        } else {
            CurrencyWallet targetWallet = currencyWalletRepository.findByUserIdAndCurrency(userUuid, toCurr)
                    .orElseGet(() -> CurrencyWallet.builder()
                            .user(user)
                            .currency(toCurr)
                            .balance(BigDecimal.ZERO)
                            .build());

            targetWallet.setBalance(targetWallet.getBalance().add(netConverted));
            CurrencyWallet savedTarget = currencyWalletRepository.save(targetWallet);

            notificationService.createNotification(
                    userUuid,
                    NotificationType.SYSTEM,
                    "Currency Converted",
                    "Successfully converted " + amount + " " + fromCurr + " to " + CURRENCY_SYMBOLS.getOrDefault(toCurr, "") + netConverted + " " + toCurr + ".",
                    savedTarget.getId() != null ? savedTarget.getId().toString() : null
            );

            return mapToWalletResponse(savedTarget);
        }
    }

    private CurrencyWalletResponse mapToWalletResponse(CurrencyWallet cw) {
        return CurrencyWalletResponse.builder()
                .id(cw.getId() != null ? cw.getId().toString() : null)
                .currency(cw.getCurrency())
                .balance(cw.getBalance())
                .symbol(CURRENCY_SYMBOLS.getOrDefault(cw.getCurrency(), "$"))
                .currencyName(CURRENCY_NAMES.getOrDefault(cw.getCurrency(), cw.getCurrency()))
                .build();
    }

    private ExchangeRateResponse mapToRateResponse(ExchangeRate rate) {
        return ExchangeRateResponse.builder()
                .id(rate.getId() != null ? rate.getId().toString() : null)
                .baseCurrency(rate.getBaseCurrency())
                .targetCurrency(rate.getTargetCurrency())
                .rate(rate.getRate())
                .feePercentage(rate.getFeePercentage())
                .build();
    }
}
