-- V5: P2P Transfers & Beneficiaries

-- Beneficiaries: saved recipients for quick transfers
CREATE TABLE beneficiaries (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    beneficiary_user_id VARCHAR(36) REFERENCES users(id),
    nickname        VARCHAR(50) NOT NULL,
    email           VARCHAR(100),
    account_number  VARCHAR(20),
    type            VARCHAR(15) NOT NULL DEFAULT 'INTERNAL',
    is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_beneficiary_user UNIQUE (user_id, email)
);

-- Transfers: wallet-to-wallet P2P transfers
CREATE TABLE transfers (
    id                  VARCHAR(36) PRIMARY KEY,
    sender_wallet_id    VARCHAR(36) NOT NULL REFERENCES wallets(id),
    receiver_wallet_id  VARCHAR(36) NOT NULL REFERENCES wallets(id),
    sender_user_id      VARCHAR(36) NOT NULL REFERENCES users(id),
    receiver_user_id    VARCHAR(36) NOT NULL REFERENCES users(id),
    amount              DECIMAL(19, 4) NOT NULL,
    fee                 DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              VARCHAR(15) NOT NULL DEFAULT 'PENDING',
    reference_id        VARCHAR(40) NOT NULL UNIQUE,
    note                TEXT,
    category            VARCHAR(50),
    sender_balance_before   DECIMAL(19, 4) NOT NULL,
    sender_balance_after    DECIMAL(19, 4) NOT NULL,
    receiver_balance_before DECIMAL(19, 4) NOT NULL,
    receiver_balance_after  DECIMAL(19, 4) NOT NULL,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beneficiaries_user ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);
CREATE INDEX idx_transfers_sender ON transfers(sender_user_id);
CREATE INDEX idx_transfers_receiver ON transfers(receiver_user_id);
CREATE INDEX idx_transfers_reference ON transfers(reference_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_created ON transfers(created_at);
CREATE INDEX idx_transfers_sender_wallet ON transfers(sender_wallet_id);
CREATE INDEX idx_transfers_receiver_wallet ON transfers(receiver_wallet_id);
