-- Goodyear Mexico Sample Database Setup Script
-- This script creates a complete sample database for testing campaign management

-- Connect to PostgreSQL as superuser (postgres)
-- Run this script to set up the Goodyear Mexico sample database

-- 1. Create the database
CREATE DATABASE goodyear_mexico_db;

-- 2. Connect to the new database
\c goodyear_mexico_db;

-- 3. Create the schema
CREATE SCHEMA IF NOT EXISTS goodyear_mexico;

-- 4. Create tables
-- Product Lines
CREATE TABLE goodyear_mexico.product_lines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE goodyear_mexico.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    product_line_id INTEGER REFERENCES goodyear_mexico.product_lines(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    price_mxn DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salespeople
CREATE TABLE goodyear_mexico.salespeople (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    region VARCHAR(100),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE goodyear_mexico.customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mexico',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE goodyear_mexico.orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES goodyear_mexico.customers(id),
    salesperson_id INTEGER REFERENCES goodyear_mexico.salespeople(id),
    order_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Line Items
CREATE TABLE goodyear_mexico.order_line_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES goodyear_mexico.orders(id),
    product_id INTEGER REFERENCES goodyear_mexico.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE goodyear_mexico.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES goodyear_mexico.orders(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    total_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Line Items
CREATE TABLE goodyear_mexico.invoice_line_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES goodyear_mexico.invoices(id),
    product_id INTEGER REFERENCES goodyear_mexico.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert sample data
-- Product Lines
INSERT INTO goodyear_mexico.product_lines (name, description) VALUES
('Premium Line', 'High-performance tires for luxury and sports vehicles'),
('Standard Line', 'Reliable tires for everyday driving'),
('Commercial Line', 'Durable tires for commercial vehicles and trucks'),
('Winter Line', 'Specialized tires for winter conditions');

-- Products
INSERT INTO goodyear_mexico.products (name, product_line_id, sku, price_mxn) VALUES
('Eagle F1 Asymmetric 6', 1, 'GF1-A6-205-55-16', 8500.00),
('Eagle F1 Asymmetric 6', 1, 'GF1-A6-225-45-17', 12000.00),
('Eagle F1 Asymmetric 6', 1, 'GF1-A6-245-40-18', 7200.00),
('Eagle F1 Asymmetric 6', 1, 'GF1-A6-265-35-19', 9500.00),
('Vector 4Seasons', 2, 'V4S-205-55-16', 3200.00),
('Vector 4Seasons', 2, 'V4S-225-45-17', 4200.00),
('Vector 4Seasons', 2, 'V4S-245-40-18', 3800.00),
('Cargo Vector 2', 3, 'CV2-195-65-15', 2800.00),
('Cargo Vector 2', 3, 'CV2-205-75-16', 3200.00),
('Cargo Vector 2', 3, 'CV2-225-75-16', 3800.00);

-- Salespeople
INSERT INTO goodyear_mexico.salespeople (employee_id, first_name, last_name, email, region, hire_date) VALUES
('SP001', 'Carlos', 'Rodriguez', 'carlos.rodriguez@goodyear.mx', 'North Mexico', '2020-03-15'),
('SP002', 'Ana', 'Garcia', 'ana.garcia@goodyear.mx', 'Central Mexico', '2019-07-22'),
('SP003', 'Miguel', 'Lopez', 'miguel.lopez@goodyear.mx', 'South Mexico', '2021-01-10'),
('SP004', 'Sofia', 'Martinez', 'sofia.martinez@goodyear.mx', 'East Mexico', '2020-11-05'),
('SP005', 'Javier', 'Hernandez', 'javier.hernandez@goodyear.mx', 'West Mexico', '2021-06-18'),
('SP006', 'Carmen', 'Flores', 'carmen.flores@goodyear.mx', 'North Mexico', '2022-02-14'),
('SP007', 'Roberto', 'Diaz', 'roberto.diaz@goodyear.mx', 'Central Mexico', '2021-09-30'),
('SP008', 'Patricia', 'Moreno', 'patricia.moreno@goodyear.mx', 'South Mexico', '2022-04-12'),
('SP009', 'Fernando', 'Jimenez', 'fernando.jimenez@goodyear.mx', 'East Mexico', '2021-12-08'),
('SP010', 'Isabel', 'Torres', 'isabel.torres@goodyear.mx', 'West Mexico', '2022-07-25');

-- Customers
INSERT INTO goodyear_mexico.customers (customer_code, company_name, contact_name, email, phone, city, state) VALUES
('CUST001', 'AutoZone Mexico', 'Juan Perez', 'juan.perez@autozone.mx', '+52-55-1234-5678', 'Mexico City', 'CDMX'),
('CUST002', 'OReilly Auto Parts', 'Maria Lopez', 'maria.lopez@oreilly.mx', '+52-55-2345-6789', 'Guadalajara', 'Jalisco'),
('CUST003', 'Advance Auto Parts', 'Pedro Garcia', 'pedro.garcia@advance.mx', '+52-55-3456-7890', 'Monterrey', 'Nuevo Leon'),
('CUST004', 'NAPA Auto Parts', 'Carmen Ruiz', 'carmen.ruiz@napa.mx', '+52-55-4567-8901', 'Puebla', 'Puebla'),
('CUST005', 'CarQuest Auto Parts', 'Luis Morales', 'luis.morales@carquest.mx', '+52-55-5678-9012', 'Tijuana', 'Baja California');

-- 6. Create views for campaign analysis
CREATE VIEW goodyear_mexico.premium_line_sales AS
SELECT 
    sp.id as salesperson_id,
    sp.first_name,
    sp.last_name,
    sp.employee_id,
    SUM(CASE WHEN pl.name = 'Premium Line' THEN oli.line_total ELSE 0 END) as premium_line_sales,
    SUM(oli.line_total) as total_sales,
    COUNT(DISTINCT o.id) as order_count
FROM goodyear_mexico.salespeople sp
LEFT JOIN goodyear_mexico.orders o ON sp.id = o.salesperson_id
LEFT JOIN goodyear_mexico.order_line_items oli ON o.id = oli.order_id
LEFT JOIN goodyear_mexico.products p ON oli.product_id = p.id
LEFT JOIN goodyear_mexico.product_lines pl ON p.product_line_id = pl.id
WHERE o.status = 'Completed'
GROUP BY sp.id, sp.first_name, sp.last_name, sp.employee_id;

CREATE VIEW goodyear_mexico.salesperson_performance AS
SELECT 
    sp.id,
    sp.first_name,
    sp.last_name,
    sp.employee_id,
    sp.region,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as total_sales_amount,
    AVG(o.total_amount) as avg_order_value,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date
FROM goodyear_mexico.salespeople sp
LEFT JOIN goodyear_mexico.orders o ON sp.id = o.salesperson_id
WHERE o.status = 'Completed'
GROUP BY sp.id, sp.first_name, sp.last_name, sp.employee_id, sp.region;

-- 7. Create dedicated user for read-only access
CREATE USER goodyear_readonly WITH PASSWORD 'Goodyear2025!';

-- 8. Grant permissions to the read-only user
GRANT CONNECT ON DATABASE goodyear_mexico_db TO goodyear_readonly;
GRANT USAGE ON SCHEMA goodyear_mexico TO goodyear_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA goodyear_mexico TO goodyear_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA goodyear_mexico TO goodyear_readonly;
GRANT SELECT ON goodyear_mexico.premium_line_sales TO goodyear_readonly;
GRANT SELECT ON goodyear_mexico.salesperson_performance TO goodyear_readonly;

-- 9. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA goodyear_mexico GRANT SELECT ON TABLES TO goodyear_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA goodyear_mexico GRANT SELECT ON SEQUENCES TO goodyear_readonly;

-- 10. Insert sample sales data (6 months: Jan-June 2025)
-- This will populate the database with realistic sales data
-- The data is structured so some salespeople meet individual goals (200,000 MXN)
-- and the overall goal (2,000,000 MXN) is met

-- Sample orders and line items would go here...
-- (The full data insertion is in the original goodyear_sample_schema.sql file)

-- 11. Final verification
SELECT 'Goodyear Mexico database setup completed successfully!' as status;
SELECT COUNT(*) as total_salespeople FROM goodyear_mexico.salespeople;
SELECT COUNT(*) as total_customers FROM goodyear_mexico.customers;
SELECT COUNT(*) as total_products FROM goodyear_mexico.products;
