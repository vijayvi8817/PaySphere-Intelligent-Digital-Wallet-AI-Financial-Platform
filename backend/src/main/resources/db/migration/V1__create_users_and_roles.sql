-- V1: Users, Roles, and User-Roles junction table
CREATE TABLE roles (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id            VARCHAR(36) PRIMARY KEY,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    phone         VARCHAR(20),
    avatar_url    VARCHAR(500),
    status        VARCHAR(25) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    kyc_status    VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed default roles
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
    (gen_random_uuid(), 'ROLE_USER', 'Standard user role', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE_MERCHANT', 'Merchant user role', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE_ADMIN', 'Administrator role', NOW(), NOW());

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
