-- Goodyear Mexico Sample Database Schema
-- This script creates a sample customer database for testing campaign management

-- Create schema
CREATE SCHEMA IF NOT EXISTS goodyear_mexico;

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

-- Insert sample data

-- Product Lines
INSERT INTO goodyear_mexico.product_lines (name, description) VALUES
('Premium Line', 'High-performance tires for luxury and sports vehicles'),
('Standard Line', 'Reliable tires for everyday vehicles'),
('Commercial Line', 'Heavy-duty tires for commercial vehicles'),
('Off-Road Line', 'Specialized tires for off-road and adventure vehicles');

-- Products
INSERT INTO goodyear_mexico.products (name, product_line_id, sku, price_mxn) VALUES
('Eagle F1 Asymmetric 6', 1, 'GF1A6-245/40R18', 8500.00),
('Eagle F1 Asymmetric 6', 1, 'GF1A6-275/35R19', 12000.00),
('Eagle F1 Asymmetric 6', 1, 'GF1A6-225/45R17', 7200.00),
('Eagle F1 Asymmetric 6', 1, 'GF1A6-255/40R18', 9500.00),
('Eagle F1 Asymmetric 6', 1, 'GF1A6-295/30R20', 15000.00),
('Vector 4Seasons Gen-3', 2, 'GV4S3-205/55R16', 3200.00),
('Vector 4Seasons Gen-3', 2, 'GV4S3-225/45R17', 4200.00),
('Vector 4Seasons Gen-3', 2, 'GV4S3-245/40R18', 5800.00),
('Cargo Vector 2', 3, 'GCV2-195/75R16', 2800.00),
('Cargo Vector 2', 3, 'GCV2-225/75R16', 3800.00),
('Wrangler All-Terrain Adventure', 4, 'GWAAT-265/70R17', 6500.00),
('Wrangler All-Terrain Adventure', 4, 'GWAAT-285/70R17', 7500.00);

-- Salespeople
INSERT INTO goodyear_mexico.salespeople (employee_id, first_name, last_name, email, region, hire_date) VALUES
('SP001', 'Carlos', 'Rodriguez', 'carlos.rodriguez@goodyear.mx', 'Mexico City', '2020-03-15'),
('SP002', 'Ana', 'Garcia', 'ana.garcia@goodyear.mx', 'Guadalajara', '2019-07-22'),
('SP003', 'Miguel', 'Lopez', 'miguel.lopez@goodyear.mx', 'Monterrey', '2021-01-10'),
('SP004', 'Sofia', 'Martinez', 'sofia.martinez@goodyear.mx', 'Puebla', '2020-11-05'),
('SP005', 'Javier', 'Hernandez', 'javier.hernandez@goodyear.mx', 'Tijuana', '2021-06-18'),
('SP006', 'Carmen', 'Gonzalez', 'carmen.gonzalez@goodyear.mx', 'Merida', '2019-09-12'),
('SP007', 'Roberto', 'Perez', 'roberto.perez@goodyear.mx', 'Leon', '2020-08-30'),
('SP008', 'Patricia', 'Sanchez', 'patricia.sanchez@goodyear.mx', 'Queretaro', '2021-03-25'),
('SP009', 'Fernando', 'Torres', 'fernando.torres@goodyear.mx', 'Aguascalientes', '2020-12-14'),
('SP010', 'Lucia', 'Flores', 'lucia.flores@goodyear.mx', 'San Luis Potosi', '2021-04-08');

-- Customers
INSERT INTO goodyear_mexico.customers (customer_code, company_name, contact_name, email, phone, city, state) VALUES
('CUST001', 'AutoZone Mexico', 'Juan Perez', 'juan.perez@autozone.mx', '+52-55-1234-5678', 'Mexico City', 'CDMX'),
('CUST002', 'O''Reilly Auto Parts', 'Maria Silva', 'maria.silva@oreilly.mx', '+52-33-2345-6789', 'Guadalajara', 'Jalisco'),
('CUST003', 'Advance Auto Parts', 'Pedro Vargas', 'pedro.vargas@advance.mx', '+52-81-3456-7890', 'Monterrey', 'Nuevo Leon'),
('CUST004', 'NAPA Auto Parts', 'Isabel Ruiz', 'isabel.ruiz@napa.mx', '+52-222-4567-8901', 'Puebla', 'Puebla'),
('CUST005', 'CarQuest Auto Parts', 'Ricardo Morales', 'ricardo.morales@carquest.mx', '+52-664-5678-9012', 'Tijuana', 'Baja California'),
('CUST006', 'AutoZone Merida', 'Elena Castro', 'elena.castro@autozone.mx', '+52-999-6789-0123', 'Merida', 'Yucatan'),
('CUST007', 'O''Reilly Leon', 'Hector Mendoza', 'hector.mendoza@oreilly.mx', '+52-477-7890-1234', 'Leon', 'Guanajuato'),
('CUST008', 'Advance Queretaro', 'Adriana Rios', 'adriana.rios@advance.mx', '+52-442-8901-2345', 'Queretaro', 'Queretaro'),
('CUST009', 'NAPA Aguascalientes', 'Oscar Vega', 'oscar.vega@napa.mx', '+52-449-9012-3456', 'Aguascalientes', 'Aguascalientes'),
('CUST010', 'CarQuest San Luis', 'Gabriela Luna', 'gabriela.luna@carquest.mx', '+52-444-0123-4567', 'San Luis Potosi', 'San Luis Potosi');

-- Generate 6 months of orders (Jan 2025 to June 2025)
-- January 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-001', 1, 1, '2025-01-05', 'Completed', 45000.00),
('ORD-2025-002', 2, 2, '2025-01-08', 'Completed', 38000.00),
('ORD-2025-003', 3, 3, '2025-01-12', 'Completed', 52000.00),
('ORD-2025-004', 4, 4, '2025-01-15', 'Completed', 29000.00),
('ORD-2025-005', 5, 5, '2025-01-18', 'Completed', 41000.00),
('ORD-2025-006', 6, 6, '2025-01-22', 'Completed', 33000.00),
('ORD-2025-007', 7, 7, '2025-01-25', 'Completed', 47000.00),
('ORD-2025-008', 8, 8, '2025-01-28', 'Completed', 36000.00),
('ORD-2025-009', 9, 9, '2025-01-30', 'Completed', 44000.00),
('ORD-2025-010', 10, 10, '2025-01-31', 'Completed', 39000.00);

-- February 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-011', 1, 1, '2025-02-03', 'Completed', 48000.00),
('ORD-2025-012', 2, 2, '2025-02-07', 'Completed', 42000.00),
('ORD-2025-013', 3, 3, '2025-02-10', 'Completed', 55000.00),
('ORD-2025-014', 4, 4, '2025-02-14', 'Completed', 31000.00),
('ORD-2025-015', 5, 5, '2025-02-17', 'Completed', 43000.00),
('ORD-2025-016', 6, 6, '2025-02-21', 'Completed', 35000.00),
('ORD-2025-017', 7, 7, '2025-02-24', '2025-02-28', 50000.00),
('ORD-2025-018', 8, 8, '2025-02-26', 'Completed', 38000.00),
('ORD-2025-019', 9, 9, '2025-02-28', 'Completed', 46000.00),
('ORD-2025-020', 10, 10, '2025-02-28', 'Completed', 41000.00);

-- March 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-021', 1, 1, '2025-03-03', 'Completed', 52000.00),
('ORD-2025-022', 2, 2, '2025-03-07', 'Completed', 45000.00),
('ORD-2025-023', 3, 3, '2025-03-10', 'Completed', 58000.00),
('ORD-2025-024', 4, 4, '2025-03-14', 'Completed', 33000.00),
('ORD-2025-025', 5, 5, '2025-03-17', 'Completed', 47000.00),
('ORD-2025-026', 6, 6, '2025-03-21', 'Completed', 37000.00),
('ORD-2025-027', 7, 7, '2025-03-24', 'Completed', 53000.00),
('ORD-2025-028', 8, 8, '2025-03-26', 'Completed', 40000.00),
('ORD-2025-029', 9, 9, '2025-03-28', 'Completed', 48000.00),
('ORD-2025-030', 10, 10, '2025-03-31', 'Completed', 43000.00);

-- April 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-031', 1, 1, '2025-04-02', 'Completed', 55000.00),
('ORD-2025-032', 2, 2, '2025-04-05', 'Completed', 48000.00),
('ORD-2025-033', 3, 3, '2025-04-08', 'Completed', 61000.00),
('ORD-2025-034', 4, 4, '2025-04-12', 'Completed', 35000.00),
('ORD-2025-035', 5, 5, '2025-04-15', 'Completed', 50000.00),
('ORD-2025-036', 6, 6, '2025-04-18', 'Completed', 39000.00),
('ORD-2025-037', 7, 7, '2025-04-22', 'Completed', 56000.00),
('ORD-2025-038', 8, 8, '2025-04-25', 'Completed', 42000.00),
('ORD-2025-039', 9, 9, '2025-04-28', 'Completed', 51000.00),
('ORD-2025-040', 10, 10, '2025-04-30', 'Completed', 46000.00);

-- May 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-041', 1, 1, '2025-05-02', 'Completed', 58000.00),
('ORD-2025-042', 2, 2, '2025-05-05', 'Completed', 51000.00),
('ORD-2025-043', 3, 3, '2025-05-08', 'Completed', 64000.00),
('ORD-2025-044', 4, 4, '2025-05-12', 'Completed', 37000.00),
('ORD-2025-045', 5, 5, '2025-05-15', 'Completed', 53000.00),
('ORD-2025-046', 6, 6, '2025-05-18', 'Completed', 41000.00),
('ORD-2025-047', 7, 7, '2025-05-22', 'Completed', 59000.00),
('ORD-2025-048', 8, 8, '2025-05-25', 'Completed', 44000.00),
('ORD-2025-049', 9, 9, '2025-05-28', 'Completed', 54000.00),
('ORD-2025-050', 10, 10, '2025-05-30', 'Completed', 49000.00);

-- June 2025
INSERT INTO goodyear_mexico.orders (order_number, customer_id, salesperson_id, order_date, status, total_amount) VALUES
('ORD-2025-051', 1, 1, '2025-06-02', 'Completed', 61000.00),
('ORD-2025-052', 2, 2, '2025-06-05', 'Completed', 54000.00),
('ORD-2025-053', 3, 3, '2025-06-08', 'Completed', 67000.00),
('ORD-2025-054', 4, 4, '2025-06-12', 'Completed', 39000.00),
('ORD-2025-055', 5, 5, '2025-06-15', 'Completed', 56000.00),
('ORD-2025-056', 6, 6, '2025-06-18', 'Completed', 43000.00),
('ORD-2025-057', 7, 7, '2025-06-22', 'Completed', 62000.00),
('ORD-2025-058', 8, 8, '2025-06-25', 'Completed', 46000.00),
('ORD-2025-059', 9, 9, '2025-06-28', 'Completed', 57000.00),
('ORD-2025-060', 10, 10, '2025-06-30', 'Completed', 52000.00);

-- Order Line Items - Focus on Premium Line products to meet campaign goals
-- January 2025 - Premium Line focus
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 1 - Carlos Rodriguez (Premium Line focus)
(1, 1, 3, 8500.00, 25500.00),  -- Eagle F1 Asymmetric 6
(1, 2, 2, 12000.00, 24000.00), -- Eagle F1 Asymmetric 6
(1, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons (Standard)

-- Order 2 - Ana Garcia
(2, 3, 2, 7200.00, 14400.00),  -- Eagle F1 Asymmetric 6
(2, 7, 3, 4200.00, 12600.00),  -- Vector 4Seasons
(2, 9, 2, 2800.00, 5600.00),   -- Cargo Vector 2
(2, 11, 1, 6500.00, 6500.00),  -- Wrangler All-Terrain

-- Order 3 - Miguel Lopez (Premium Line focus)
(3, 2, 3, 12000.00, 36000.00), -- Eagle F1 Asymmetric 6
(3, 4, 2, 9500.00, 19000.00),  -- Eagle F1 Asymmetric 6
(3, 8, 1, 5800.00, 5800.00),   -- Vector 4Seasons

-- Order 4 - Sofia Martinez
(4, 1, 1, 8500.00, 8500.00),   -- Eagle F1 Asymmetric 6
(4, 6, 4, 3200.00, 12800.00),  -- Vector 4Seasons
(4, 10, 2, 3800.00, 7600.00),  -- Cargo Vector 2

-- Order 5 - Javier Hernandez
(5, 3, 2, 7200.00, 14400.00),  -- Eagle F1 Asymmetric 6
(5, 5, 1, 15000.00, 15000.00), -- Eagle F1 Asymmetric 6
(5, 7, 2, 4200.00, 8400.00),  -- Vector 4Seasons
(5, 12, 1, 7500.00, 7500.00), -- Wrangler All-Terrain

-- Order 6 - Carmen Gonzalez
(6, 1, 2, 8500.00, 17000.00),  -- Eagle F1 Asymmetric 6
(6, 6, 3, 3200.00, 9600.00),  -- Vector 4Seasons
(6, 9, 2, 2800.00, 5600.00),  -- Cargo Vector 2

-- Order 7 - Roberto Perez (Premium Line focus)
(7, 2, 2, 12000.00, 24000.00), -- Eagle F1 Asymmetric 6
(7, 4, 2, 9500.00, 19000.00), -- Eagle F1 Asymmetric 6
(7, 8, 1, 5800.00, 5800.00),  -- Vector 4Seasons

-- Order 8 - Patricia Sanchez
(8, 1, 1, 8500.00, 8500.00),  -- Eagle F1 Asymmetric 6
(8, 3, 2, 7200.00, 14400.00), -- Eagle F1 Asymmetric 6
(8, 6, 3, 3200.00, 9600.00), -- Vector 4Seasons
(8, 11, 1, 6500.00, 6500.00), -- Wrangler All-Terrain

-- Order 9 - Fernando Torres (Premium Line focus)
(9, 2, 3, 12000.00, 36000.00), -- Eagle F1 Asymmetric 6
(9, 5, 1, 15000.00, 15000.00), -- Eagle F1 Asymmetric 6
(9, 7, 1, 4200.00, 4200.00), -- Vector 4Seasons

-- Order 10 - Lucia Flores
(10, 1, 2, 8500.00, 17000.00), -- Eagle F1 Asymmetric 6
(10, 4, 1, 9500.00, 9500.00), -- Eagle F1 Asymmetric 6
(10, 6, 3, 3200.00, 9600.00), -- Vector 4Seasons
(10, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- Continue with more order line items for February-June...
-- (Adding a few more key orders to meet campaign goals)

-- February 2025 - Additional Premium Line sales
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 11 - Carlos Rodriguez (continuing Premium Line focus)
(11, 1, 4, 8500.00, 34000.00),  -- Eagle F1 Asymmetric 6
(11, 2, 2, 12000.00, 24000.00), -- Eagle F1 Asymmetric 6
(11, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons

-- Order 12 - Ana Garcia
(12, 3, 3, 7200.00, 21600.00),  -- Eagle F1 Asymmetric 6
(12, 7, 2, 4200.00, 8400.00),  -- Vector 4Seasons
(12, 9, 2, 2800.00, 5600.00),  -- Cargo Vector 2

-- Order 13 - Miguel Lopez (continuing Premium Line focus)
(13, 2, 4, 12000.00, 48000.00), -- Eagle F1 Asymmetric 6
(13, 4, 1, 9500.00, 9500.00),  -- Eagle F1 Asymmetric 6

-- Order 14 - Sofia Martinez
(14, 1, 2, 8500.00, 17000.00),  -- Eagle F1 Asymmetric 6
(14, 6, 3, 3200.00, 9600.00),  -- Vector 4Seasons
(14, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- March 2025 - Additional Premium Line sales
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 21 - Carlos Rodriguez (continuing Premium Line focus)
(21, 1, 5, 8500.00, 42500.00),  -- Eagle F1 Asymmetric 6
(21, 2, 1, 12000.00, 12000.00), -- Eagle F1 Asymmetric 6
(21, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons

-- Order 22 - Ana Garcia
(22, 3, 4, 7200.00, 28800.00),  -- Eagle F1 Asymmetric 6
(22, 7, 3, 4200.00, 12600.00), -- Vector 4Seasons
(22, 9, 1, 2800.00, 2800.00),  -- Cargo Vector 2

-- Order 23 - Miguel Lopez (continuing Premium Line focus)
(23, 2, 5, 12000.00, 60000.00), -- Eagle F1 Asymmetric 6
(23, 4, 1, 9500.00, 9500.00),  -- Eagle F1 Asymmetric 6

-- Order 24 - Sofia Martinez
(24, 1, 3, 8500.00, 25500.00),  -- Eagle F1 Asymmetric 6
(24, 6, 2, 3200.00, 6400.00),  -- Vector 4Seasons
(24, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- April 2025 - Additional Premium Line sales
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 31 - Carlos Rodriguez (continuing Premium Line focus)
(31, 1, 6, 8500.00, 51000.00),  -- Eagle F1 Asymmetric 6
(31, 2, 1, 12000.00, 12000.00), -- Eagle F1 Asymmetric 6
(31, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons

-- Order 32 - Ana Garcia
(32, 3, 5, 7200.00, 36000.00),  -- Eagle F1 Asymmetric 6
(32, 7, 4, 4200.00, 16800.00), -- Vector 4Seasons

-- Order 33 - Miguel Lopez (continuing Premium Line focus)
(33, 2, 6, 12000.00, 72000.00), -- Eagle F1 Asymmetric 6
(33, 4, 1, 9500.00, 9500.00),  -- Eagle F1 Asymmetric 6

-- Order 34 - Sofia Martinez
(34, 1, 4, 8500.00, 34000.00),  -- Eagle F1 Asymmetric 6
(34, 6, 1, 3200.00, 3200.00),  -- Vector 4Seasons
(34, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- May 2025 - Additional Premium Line sales
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 41 - Carlos Rodriguez (continuing Premium Line focus)
(41, 1, 7, 8500.00, 59500.00),  -- Eagle F1 Asymmetric 6
(41, 2, 1, 12000.00, 12000.00), -- Eagle F1 Asymmetric 6
(41, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons

-- Order 42 - Ana Garcia
(42, 3, 6, 7200.00, 43200.00),  -- Eagle F1 Asymmetric 6
(42, 7, 5, 4200.00, 21000.00), -- Vector 4Seasons

-- Order 43 - Miguel Lopez (continuing Premium Line focus)
(43, 2, 7, 12000.00, 84000.00), -- Eagle F1 Asymmetric 6
(43, 4, 1, 9500.00, 9500.00),  -- Eagle F1 Asymmetric 6

-- Order 44 - Sofia Martinez
(44, 1, 5, 8500.00, 42500.00),  -- Eagle F1 Asymmetric 6
(44, 6, 1, 3200.00, 3200.00),  -- Vector 4Seasons
(44, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- June 2025 - Additional Premium Line sales
INSERT INTO goodyear_mexico.order_line_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Order 51 - Carlos Rodriguez (continuing Premium Line focus)
(51, 1, 8, 8500.00, 68000.00),  -- Eagle F1 Asymmetric 6
(51, 2, 1, 12000.00, 12000.00), -- Eagle F1 Asymmetric 6
(51, 6, 1, 3200.00, 3200.00),   -- Vector 4Seasons

-- Order 52 - Ana Garcia
(52, 3, 7, 7200.00, 50400.00),  -- Eagle F1 Asymmetric 6
(52, 7, 6, 4200.00, 25200.00), -- Vector 4Seasons

-- Order 53 - Miguel Lopez (continuing Premium Line focus)
(53, 2, 8, 12000.00, 96000.00), -- Eagle F1 Asymmetric 6
(53, 4, 1, 9500.00, 9500.00),  -- Eagle F1 Asymmetric 6

-- Order 54 - Sofia Martinez
(54, 1, 6, 8500.00, 51000.00),  -- Eagle F1 Asymmetric 6
(54, 6, 1, 3200.00, 3200.00),  -- Vector 4Seasons
(54, 10, 1, 3800.00, 3800.00); -- Cargo Vector 2

-- Create views for campaign analysis
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

-- Grant permissions to incentiva user
GRANT USAGE ON SCHEMA goodyear_mexico TO incentiva;
GRANT SELECT ON ALL TABLES IN SCHEMA goodyear_mexico TO incentiva;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA goodyear_mexico TO incentiva;
GRANT SELECT ON goodyear_mexico.premium_line_sales TO incentiva;
GRANT SELECT ON goodyear_mexico.salesperson_performance TO incentiva;

-- Insert sample system configurations (this will go to the main incentiva database)
-- Note: This table exists in the main application database, not in goodyear_mexico schema
-- The campaign management system will connect to this database in read-only mode
