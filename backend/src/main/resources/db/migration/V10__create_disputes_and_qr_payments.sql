-- ============================================
-- V10: Transaction Disputes & QR Payment Tokens
-- ============================================

-- Dispute table for transaction disputes
CREATE TABLE IF NOT EXISTS disputes (
    id              VARCHAR(36) PRIMARY KEY,
    transfer_id     VARCHAR(36) NOT NULL REFERENCES transfers(id),
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    reason          VARCHAR(30) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    description     TEXT NOT NULL,
    resolution_note TEXT,
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_user_id ON disputes(user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_transfer_id ON disputes(transfer_id);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);

-- QR payment tokens for quick P2P payments
CREATE TABLE IF NOT EXISTS qr_payment_tokens (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL REFERENCES users(id),
    token           VARCHAR(64) NOT NULL UNIQUE,
    amount          DECIMAL(19,4),
    note            VARCHAR(255),
    single_use      BOOLEAN NOT NULL DEFAULT TRUE,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_tokens_token ON qr_payment_tokens(token);
CREATE INDEX idx_qr_tokens_user_id ON qr_payment_tokens(user_id);
CREATE INDEX idx_qr_tokens_expires_at ON qr_payment_tokens(expires_at);
