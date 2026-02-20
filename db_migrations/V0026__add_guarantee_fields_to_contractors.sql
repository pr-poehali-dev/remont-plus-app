ALTER TABLE t_p46588937_remont_plus_app.contractors
  ADD COLUMN IF NOT EXISTS guarantee_period varchar(20) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS guarantee_description text DEFAULT '';
