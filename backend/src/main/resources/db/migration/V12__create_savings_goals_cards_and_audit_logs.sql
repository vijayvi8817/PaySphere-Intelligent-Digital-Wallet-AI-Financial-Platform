-- Migration V12: Create Savings Goals, Virtual Cards, and Audit Logs tables

-- 1. Savings Goals Table
CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE,
    is_auto_roundup_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    color VARCHAR(30) DEFAULT 'bg-emerald-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON savings_goals(status);

-- 2. Virtual & Physical Cards Table
CREATE TABLE IF NOT EXISTS virtual_cards (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number_masked VARCHAR(20) NOT NULL,
    card_number_encrypted VARCHAR(255) NOT NULL,
    cardholder_name VARCHAR(100) NOT NULL,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    card_type VARCHAR(20) NOT NULL DEFAULT 'VIRTUAL',
    card_network VARCHAR(20) NOT NULL DEFAULT 'VISA',
    daily_limit NUMERIC(15, 2) NOT NULL DEFAULT 1000.00,
    monthly_limit NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
    spent_this_month NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    online_payments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    international_payments_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    atm_withdrawals_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    pin VARCHAR(4) DEFAULT '1234',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_virtual_cards_user ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'SECURITY',
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) DEFAULT 'Browser',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
