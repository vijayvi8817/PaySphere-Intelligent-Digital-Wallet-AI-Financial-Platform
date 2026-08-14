-- V9: Create recurring_payments table for scheduled transfers
CREATE TABLE IF NOT EXISTS recurring_payments (
    id              VARCHAR(36) PRIMARY KEY,
    user_id         VARCHAR(36) NOT NULL,
    recipient_email VARCHAR(100) NOT NULL,
    amount          NUMERIC(19, 4) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    frequency       VARCHAR(10) NOT NULL,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVE',
    note            VARCHAR(255),
    category        VARCHAR(50),
    start_date      DATE NOT NULL,
    next_execution  DATE NOT NULL,
    end_date        DATE,
    last_executed   TIMESTAMP,
    total_executed  INT NOT NULL DEFAULT 0,
    max_executions  INT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_recurring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recurring_user_id ON recurring_payments(user_id);
CREATE INDEX idx_recurring_status ON recurring_payments(status);
CREATE INDEX idx_recurring_next_execution ON recurring_payments(next_execution);
CREATE INDEX idx_recurring_status_next ON recurring_payments(status, next_execution);
