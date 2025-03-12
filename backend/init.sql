-- init.sql
-- Create the database user with a secure password, but only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'roster_royals_user') THEN
    CREATE USER roster_royals_user WITH PASSWORD 'your_secure_password';
  END IF;
END
$$;

-- Ensure the database exists
SELECT 'CREATE DATABASE roster_royals'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'roster_royals')\gexec

-- Grant all necessary privileges
GRANT ALL PRIVILEGES ON DATABASE roster_royals TO roster_royals_user;
ALTER USER roster_royals_user CREATEDB;

-- Optional: Grant privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO roster_royals_user;