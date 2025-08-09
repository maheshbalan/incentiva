#!/bin/bash
set -e

# Create the database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Grant all privileges to the user
    GRANT ALL PRIVILEGES ON DATABASE incentiva_dev TO incentiva;
    GRANT ALL ON SCHEMA public TO incentiva;
    ALTER USER incentiva CREATEDB;
EOSQL

echo "Database initialization completed."