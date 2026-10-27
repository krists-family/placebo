CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text NOT NULL,
  color text NOT NULL,
  color_hex text NOT NULL,
  image text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  featured integer NOT NULL DEFAULT 0,
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id),
  title text NOT NULL,
  sku text NOT NULL UNIQUE,
  price integer NOT NULL CHECK (price >= 0),
  stock integer NOT NULL CHECK (stock >= 0)
);
CREATE INDEX IF NOT EXISTS variants_product ON variants(product_id);
CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS carts (
  id text PRIMARY KEY,
  visitor_id text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  country text NOT NULL DEFAULT 'es',
  code text NOT NULL DEFAULT '',
  order_id text,
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS carts_visitor_status ON carts(visitor_id, status);
CREATE TABLE IF NOT EXISTS cart_items (
  id text PRIMARY KEY,
  cart_id text NOT NULL REFERENCES carts(id),
  variant_id text NOT NULL REFERENCES variants(id),
  personalization text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 99)
);
CREATE INDEX IF NOT EXISTS cart_items_cart ON cart_items(cart_id);
CREATE UNIQUE INDEX IF NOT EXISTS cart_item_identity ON cart_items(cart_id, variant_id, personalization);
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  number text NOT NULL,
  cart_id text NOT NULL,
  visitor_id text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'placed',
  payment_status text NOT NULL DEFAULT 'test',
  subtotal integer NOT NULL,
  discount integer NOT NULL,
  shipping integer NOT NULL,
  total integer NOT NULL,
  code text NOT NULL DEFAULT '',
  items text NOT NULL,
  address text NOT NULL,
  note text NOT NULL DEFAULT '',
  tracking text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_cart ON orders(cart_id);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
CREATE TABLE IF NOT EXISTS discounts (
  code text PRIMARY KEY,
  percent integer NOT NULL CHECK (percent >= 1 AND percent <= 100),
  active integer NOT NULL DEFAULT 1,
  min_amount integer NOT NULL DEFAULT 0,
  usage_limit integer NOT NULL DEFAULT 1000000000,
  used integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS subscribers (email text PRIMARY KEY, created_at text NOT NULL);
CREATE TABLE IF NOT EXISTS inquiries (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  team text NOT NULL,
  quantity integer NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at text NOT NULL
);
