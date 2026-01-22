INSERT INTO users (
  id,
  phone,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  kyc_status,
  status,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '0899999999',
  'admin@jecoplus.com',
  '$2b$10$XmBZdCXuQ4.pZMbKqR8bDOvxHEj9ZQxY6P4jCXdR8ZMbKqR8bDOvxH',  -- admin123
  'Admin',
  'JECO+',
  'ADMIN',
  'VERIFIED',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO NOTHING;
