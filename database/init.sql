CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents > 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents > 0),
  status text NOT NULL CHECK (status IN ('pending', 'fulfilled', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at);

INSERT INTO products (id, name, price_cents)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Reliability Handbook', 4900),
  ('22222222-2222-4222-8222-222222222222', 'Incident Commander Mug', 1900)
ON CONFLICT (id) DO NOTHING;
