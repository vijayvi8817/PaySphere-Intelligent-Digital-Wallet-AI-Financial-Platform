-- V4: Digital Wallets table
CREATE TABLE wallets (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_number   VARCHAR(16) NOT NULL UNIQUE,
    balance         DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    reward_points   INTEGER NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wallets_user UNIQUE (user_id)
);

-- Wallet transactions ledger (separate from account transactions)
CREATE TABLE wallet_transactions (
    id              VARCHAR(36) PRIMARY KEY,
    wallet_id       VARCHAR(36) NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type            VARCHAR(15) NOT NULL,
    amount          DECIMAL(19, 4) NOT NULL,
    balance_before  DECIMAL(19, 4) NOT NULL,
    balance_after   DECIMAL(19, 4) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    status          VARCHAR(15) NOT NULL DEFAULT 'COMPLETED',
    reference_id    VARCHAR(40) NOT NULL UNIQUE,
    description     TEXT,
    category        VARCHAR(50),
    reward_points   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_wallet_number ON wallets(wallet_number);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallet_txn_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_txn_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_txn_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_txn_reference ON wallet_transactions(reference_id);
CREATE INDEX idx_wallet_txn_created ON wallet_transactions(created_at);
