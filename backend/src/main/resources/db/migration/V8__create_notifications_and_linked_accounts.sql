-- ============================================
-- V8: Notifications & Linked Bank Accounts
-- ============================================

-- 1. Notifications table
CREATE TABLE notifications (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)  NOT NULL,
    type        VARCHAR(30)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    reference_id VARCHAR(40),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notification_created_at ON notifications(created_at DESC);

-- 2. Linked bank accounts table
CREATE TABLE linked_accounts (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id         VARCHAR(36)     NOT NULL,
    account_name    VARCHAR(100)    NOT NULL,
    bank_name       VARCHAR(100)    NOT NULL,
    account_number  VARCHAR(30)     NOT NULL,
    routing_number  VARCHAR(20),
    account_type    VARCHAR(20)     NOT NULL DEFAULT 'CHECKING',
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    is_primary      BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_linked_account_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_linked_account_user_id ON linked_accounts(user_id);
CREATE UNIQUE INDEX idx_linked_account_unique ON linked_accounts(user_id, bank_name, account_number);
