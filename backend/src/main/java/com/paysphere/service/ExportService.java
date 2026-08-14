package com.paysphere.service;

import java.util.UUID;

public interface ExportService {

    byte[] exportWalletTransactions(UUID userId, String format, Integer month, Integer year);

    byte[] exportTransfers(UUID userId, String format, String direction);
}
