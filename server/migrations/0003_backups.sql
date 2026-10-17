-- Online backup for paid users (spec.md section 4): numbers only, never photos or address.
CREATE TABLE backups (
  user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  data TEXT NOT NULL, -- JSON from the phone, with photos and address removed
  updated_at TEXT NOT NULL
);
