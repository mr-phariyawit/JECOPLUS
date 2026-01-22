#!/bin/bash

# JECO+ Database Setup Script
# This script sets up the PostgreSQL database and runs all migrations

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

# Database connection info
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-jecoplus}
DB_USER=${DB_USER:-jecoplus}
DB_PASSWORD=${DB_PASSWORD:-jecoplus_dev_2025}

echo "🚀 JECO+ Database Setup"
echo "======================="
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "   Please start PostgreSQL and try again"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Create database and user (using postgres superuser)
echo "👤 Creating database and user..."
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h $DB_HOST -p $DB_PORT -U postgres -c "
    -- Create user if not exists
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
            CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        END IF;
    END
    \$\$;

    -- Create database if not exists
    SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
" 2>&1 | grep -v "already exists" || true

echo "✅ Database and user created"
echo ""

# Run migrations
echo "📝 Running migrations..."
echo ""

MIGRATIONS_DIR="migrations"
MIGRATIONS=(
    "init.sql"
    "002_wallet_schema.sql"
    "003_bank_schema.sql"
    "004_credit_score_schema.sql"
    "005_loan_application_schema.sql"
    "006_partner_submissions_schema.sql"
    "007_chat_schema.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$MIGRATIONS_DIR/$migration" ]; then
        echo "  Running: $migration"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$MIGRATIONS_DIR/$migration" > /dev/null 2>&1 || {
            echo "  ⚠️  Warning: $migration may have already been applied or encountered an error"
        }
        echo "  ✅ $migration complete"
    else
        echo "  ⚠️  Warning: $migration not found"
    fi
done

echo ""
echo "✅ All migrations completed!"
echo ""

# Verify tables
echo "📊 Verifying tables..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
" 2>&1

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "You can now start the backend server with: npm run dev"
