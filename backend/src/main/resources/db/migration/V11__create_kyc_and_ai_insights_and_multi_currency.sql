-- Create kyc_documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    id_front_url VARCHAR(255),
    id_back_url VARCHAR(255),
    selfie_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(status);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    summary TEXT NOT NULL,
    recommendation TEXT,
    impact_score INT NOT NULL DEFAULT 50,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);

-- Create multi_currency_wallets table
CREATE TABLE IF NOT EXISTS multi_currency_wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_currency UNIQUE (user_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_multi_currency_user ON multi_currency_wallets(user_id);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id VARCHAR(36) PRIMARY KEY,
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(12, 6) NOT NULL,
    fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.50,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_base_target UNIQUE (base_currency, target_currency)
);

-- Seed exchange rates
INSERT INTO exchange_rates (id, base_currency, target_currency, rate, fee_percentage)
VALUES 
    (gen_random_uuid()::text, 'USD', 'EUR', 0.920000, 0.40),
    (gen_random_uuid()::text, 'USD', 'GBP', 0.790000, 0.40),
    (gen_random_uuid()::text, 'USD', 'JPY', 154.500000, 0.50),
    (gen_random_uuid()::text, 'USD', 'CAD', 1.360000, 0.45),
    (gen_random_uuid()::text, 'USD', 'INR', 83.450000, 0.50),
    (gen_random_uuid()::text, 'USD', 'AUD', 1.520000, 0.45),
    (gen_random_uuid()::text, 'EUR', 'USD', 1.087000, 0.40),
    (gen_random_uuid()::text, 'GBP', 'USD', 1.265000, 0.40),
    (gen_random_uuid()::text, 'JPY', 'USD', 0.006470, 0.50),
    (gen_random_uuid()::text, 'CAD', 'USD', 0.735000, 0.45),
    (gen_random_uuid()::text, 'INR', 'USD', 0.011980, 0.50),
    (gen_random_uuid()::text, 'AUD', 'USD', 0.658000, 0.45)
ON CONFLICT (base_currency, target_currency) DO NOTHING;
