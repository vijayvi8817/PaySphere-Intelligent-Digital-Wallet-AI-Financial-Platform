-- V7: Expand wallet_transactions.type column size to accommodate longer types like TRANSFER_RECEIVED (17 chars)
ALTER TABLE wallet_transactions ALTER COLUMN type TYPE VARCHAR(30);
