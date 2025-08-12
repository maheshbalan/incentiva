# 🚗 Goodyear Mexico Sample Database Setup Guide

## 📋 Overview
This guide sets up a complete sample database for testing the Incentiva loyalty campaign management system. The database contains 8 months of realistic sales data (Jan-Aug 2025) with 10 salespeople and Premium Line product focus.

## 🎯 Campaign Goals
- **Overall Goal**: Exceed 2,000,000 MXN in Premium Line sales ✅
- **Individual Goals**: 5 out of 10 salespeople exceed 200,000 MXN individual quota ✅
- **Data Period**: January - August 2025 (8 months) ✅

## 🗄️ Database Configuration

### Database Details
- **Database Name**: `goodyear_mexico_db`
- **Schema**: `goodyear_mexico`
- **Port**: `5432` (default PostgreSQL)
- **Host**: `localhost` (or your Docker container IP)

### User Credentials

#### 1. AI User (Primary - for Anthropic access)
- **Username**: `goodyear_ai_user`
- **Password**: `GoodyearAI2025!`
- **Permissions**: Read-only access to all tables and views
- **Purpose**: Anthropic AI model access for schema analysis and code generation

#### 2. Readonly User (Secondary)
- **Username**: `goodyear_readonly`
- **Password**: `GoodyearRead2025!`
- **Permissions**: Read-only access to all tables and views
- **Purpose**: General read-only access for reporting

## 🚀 Setup Instructions

### Step 1: Create Database and User
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres -h localhost -p 5432

-- Run the setup script
\i backend/prisma/setup_goodyear_complete.sql
```

### Step 2: Complete Data Population
```sql
-- Connect to the new database
\c goodyear_mexico_db

-- Run the data completion script
\i backend/prisma/complete_goodyear_data.sql
```

### Step 3: Verify Setup
```sql
-- Check database status
SELECT 'Database setup completed!' as status;

-- Verify salespeople count
SELECT COUNT(*) as total_salespeople FROM goodyear_mexico.salespeople;

-- Verify invoice count
SELECT COUNT(*) as total_invoices FROM goodyear_mexico.invoices;

-- Check total sales amount
SELECT SUM(total_amount) as total_sales FROM goodyear_mexico.invoices WHERE status = 'Paid';

-- Verify Premium Line sales distribution
SELECT 
    pl.name as product_line,
    COUNT(*) as total_items,
    SUM(ili.line_total) as total_sales,
    ROUND(SUM(ili.line_total) * 100.0 / (SELECT SUM(line_total) FROM goodyear_mexico.invoice_line_items), 2) as percentage
FROM goodyear_mexico.invoice_line_items ili
JOIN goodyear_mexico.products p ON ili.product_id = p.id
JOIN goodyear_mexico.product_lines pl ON p.product_line_id = pl.id
GROUP BY pl.name, pl.id
ORDER BY total_sales DESC;
```

## 🔗 Connection Strings

### For Campaign Creation Form
Use these values in the "Database Connection" step:

- **Database Type**: `postgres`
- **Database Host**: `localhost` (or Docker container IP)
- **Database Port**: `5432`
- **Database Name**: `goodyear_mexico_db`
- **Database Username**: `goodyear_ai_user`
- **Database Password**: `GoodyearAI2025!`

### For Direct Database Access
```bash
# Connect as AI user
psql -U goodyear_ai_user -h localhost -p 5432 -d goodyear_mexico_db

# Connect as readonly user
psql -U goodyear_readonly -h localhost -p 5432 -d goodyear_mexico_db
```

## 📊 Database Schema

### Core Tables
1. **`product_lines`** - Product categories (Premium, Standard, Commercial)
2. **`products`** - Individual tire products with SKUs and prices
3. **`salespeople`** - 10 sales representatives with regions
4. **`customers`** - 5 major auto parts retailers
5. **`invoices`** - 40 paid invoices (Jan-Aug 2025)
6. **`invoice_line_items`** - Detailed product sales per invoice

### Analysis Views
1. **`premium_line_sales`** - Salesperson performance by product line
2. **`salesperson_performance`** - Overall salesperson metrics

## 🎯 Campaign Data Validation

### Expected Results
- **Total Sales**: > 2,000,000 MXN ✅
- **Premium Line Sales**: 70-80% of total sales ✅
- **Individual Goal Achievers**: 5 out of 10 salespeople exceed 200K MXN ✅
- **Data Coverage**: 8 months (Jan-Aug 2025) ✅

### Sample Queries for Testing
```sql
-- Check individual salesperson performance
SELECT 
    sp.first_name,
    sp.last_name,
    SUM(i.total_amount) as total_sales,
    CASE 
        WHEN SUM(i.total_amount) >= 200000 THEN 'Goal Achieved'
        ELSE 'Goal Not Met'
    END as goal_status
FROM goodyear_mexico.salespeople sp
LEFT JOIN goodyear_mexico.invoices i ON sp.id = i.salesperson_id
WHERE i.status = 'Paid'
GROUP BY sp.id, sp.first_name, sp.last_name
ORDER BY total_sales DESC;

-- Check Premium Line sales by month
SELECT 
    DATE_TRUNC('month', i.invoice_date) as month,
    SUM(CASE WHEN pl.name = 'Premium Line' THEN ili.line_total ELSE 0 END) as premium_sales,
    SUM(ili.line_total) as total_sales,
    ROUND(SUM(CASE WHEN pl.name = 'Premium Line' THEN ili.line_total ELSE 0 END) * 100.0 / SUM(ili.line_total), 2) as premium_percentage
FROM goodyear_mexico.invoices i
JOIN goodyear_mexico.invoice_line_items ili ON i.id = ili.invoice_id
JOIN goodyear_mexico.products p ON ili.product_id = p.id
JOIN goodyear_mexico.product_lines pl ON p.product_line_id = pl.id
WHERE i.status = 'Paid'
GROUP BY DATE_TRUNC('month', i.invoice_date)
ORDER BY month;
```

## 🔐 Security Notes
- **Read-only Access**: Both users have read-only permissions only
- **No Write Access**: Users cannot modify, insert, or delete data
- **Schema Isolation**: Access limited to `goodyear_mexico` schema only
- **Connection Logging**: All connections are logged for audit purposes

## 🚀 Next Steps
1. **Database Setup**: Run the setup scripts
2. **Campaign Creation**: Use the database credentials in campaign creation
3. **AI Integration**: Anthropic will analyze schema and generate code
4. **Campaign Execution**: System will process invoices and allocate points

## 📞 Support
If you encounter any issues during setup:
1. Check PostgreSQL logs: `docker logs incentiva-postgres`
2. Verify container status: `docker-compose ps`
3. Test connection: `psql -U goodyear_ai_user -h localhost -p 5432 -d goodyear_mexico_db`

---
**Database Ready for Campaign Management System! 🎯**
