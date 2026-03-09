CREATE UNIQUE INDEX IF NOT EXISTS parsed_companies_inn_unique 
ON t_p46588937_remont_plus_app.parsed_companies (inn) 
WHERE inn IS NOT NULL AND inn != '';