ALTER TABLE t_p46588937_remont_plus_app.users DROP CONSTRAINT users_phone_key;
CREATE UNIQUE INDEX users_phone_filled_key ON t_p46588937_remont_plus_app.users (phone) WHERE phone <> '';