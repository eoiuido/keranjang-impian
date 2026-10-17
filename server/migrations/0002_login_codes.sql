-- 6-digit email login codes (spec.md S14). Only a hash of the code is stored.
CREATE TABLE login_codes (
  email TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL,
  sends_in_hour INTEGER NOT NULL DEFAULT 1,
  hour_started_at TEXT NOT NULL
);
