-- V6: Create wallets for any existing users who don't have one
INSERT INTO wallets (id, user_id, wallet_number, balance, reward_points, currency, status, created_at, updated_at)
SELECT
    gen_random_uuid()::varchar,
    u.id,
    LPAD(FLOOR(RANDOM() * 10000000000000000)::bigint::text, 16, '0'),
    0.0000,
    0,
    'USD',
    'ACTIVE',
    NOW(),
    NOW()
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);
