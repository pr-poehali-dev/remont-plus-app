ALTER TABLE t_p46588937_remont_plus_app.contractors
  ADD COLUMN IF NOT EXISTS telegram varchar(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp varchar(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram varchar(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS website varchar(255) DEFAULT '';
