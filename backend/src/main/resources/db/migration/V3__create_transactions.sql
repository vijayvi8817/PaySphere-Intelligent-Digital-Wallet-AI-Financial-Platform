-- V3: Transactions table
CREATE TABLE transactions (
    id                     VARCHAR(36) PRIMARY KEY,
    source_account_id      VARCHAR(36) REFERENCES accounts(id),
    destination_account_id VARCHAR(36) REFERENCES accounts(id),
    amount                 DECIMAL(19, 4) NOT NULL,
    currency               VARCHAR(3) NOT NULL DEFAULT 'USD',
    type                   VARCHAR(15) NOT NULL,
    status                 VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    reference_id           VARCHAR(40) NOT NULL UNIQUE,
    description            TEXT,
    category               VARCHAR(50),
    fee                    DECIMAL(19, 4) DEFAULT 0.0000,
    created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_source ON transactions(source_account_id);
CREATE INDEX idx_transactions_dest ON transactions(destination_account_id);
CREATE INDEX idx_transactions_reference ON transactions(reference_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
