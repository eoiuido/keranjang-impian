-- Paid users only (spec.md section 4). No names, phones, addresses or photos.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- also DOKU's invoice_number
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'yearly')),
  amount INTEGER NOT NULL, -- Rupiah, set by the server
  offer INTEGER NOT NULL DEFAULT 0, -- 1 = decline-offer price
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | expired | review
  payment_url TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  checked_at TEXT, -- last time we asked DOKU about it
  paid_at TEXT,
  paid_amount INTEGER,
  doku_channel TEXT
);
CREATE INDEX orders_email ON orders (email, status);
CREATE INDEX orders_pending ON orders (status, created_at);

CREATE TABLE access (
  user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  ends_at TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY, -- SHA-256 of the token; the token itself is never stored
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);
