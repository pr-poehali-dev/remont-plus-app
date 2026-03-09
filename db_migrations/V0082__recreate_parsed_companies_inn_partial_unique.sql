DROP INDEX IF EXISTS t_p46588937_remont_plus_app.parsed_companies_inn_unique;

CREATE UNIQUE INDEX parsed_companies_inn_unique_full
ON t_p46588937_remont_plus_app.parsed_companies (inn)
WHERE inn IS NOT NULL AND inn != '';