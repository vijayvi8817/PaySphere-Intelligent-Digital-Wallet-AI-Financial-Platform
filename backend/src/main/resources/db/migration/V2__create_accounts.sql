-- V2: Accounts table
CREATE TABLE accounts (
    id             VARCHAR(36) PRIMARY KEY,
    user_id        VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type   VARCHAR(10) NOT NULL,
    balance        DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    currency       VARCHAR(3)  NOT NULL DEFAULT 'USD',
    status         VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    account_name   VARCHAR(50),
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status);
