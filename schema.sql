-- Delivery Hub API — PostgreSQL schema

CREATE TYPE user_role AS ENUM ('owner', 'driver');
CREATE TYPE order_status AS ENUM ('preparing', 'out_for_delivery', 'delivered');

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(50) NOT NULL UNIQUE,
  email           VARCHAR(255) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'driver',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(50) NOT NULL,
  address     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_name ON customers (name);
CREATE INDEX idx_customers_phone ON customers (phone);

CREATE TABLE orders (
  id                  SERIAL PRIMARY KEY,
  customer_id         INTEGER NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,
  assigned_driver_id  INTEGER REFERENCES users (id) ON DELETE SET NULL,
  items               JSONB NOT NULL,
  status              order_status NOT NULL DEFAULT 'preparing',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_assigned_driver_id ON orders (assigned_driver_id);
CREATE INDEX idx_orders_status ON orders (status);

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
