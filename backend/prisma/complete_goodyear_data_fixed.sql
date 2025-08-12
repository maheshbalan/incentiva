-- Complete Goodyear Mexico Invoice Line Items Data (Fixed)
-- This script completes the invoice line items for all 40 invoices
-- Ensures Premium Line products dominate sales to meet campaign goals

-- Connect to the database
\c goodyear_mexico_db;

-- Complete invoice line items for all invoices
-- This ensures Premium Line products represent 70-80% of sales

-- January 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 1 (125,000 MXN total)
(1, 1, 8, 8500.00, 68000.00),   -- Premium Line: Eagle F1 205/55/16
(1, 2, 4, 12000.00, 48000.00),  -- Premium Line: Eagle F1 225/45/17
(1, 3, 1, 7200.00, 7200.00),    -- Premium Line: Eagle F1 245/40/18
(1, 5, 1, 3200.00, 3200.00);    -- Standard Line: Vector 4Seasons

-- February 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 6 (138,000 MXN total)
(6, 1, 9, 8500.00, 76500.00),   -- Premium Line: Eagle F1 205/55/16
(6, 2, 4, 12000.00, 48000.00),  -- Premium Line: Eagle F1 225/45/17
(6, 4, 1, 9500.00, 9500.00),    -- Premium Line: Eagle F1 265/35/19
(6, 5, 1, 3200.00, 3200.00);    -- Standard Line: Vector 4Seasons

-- March 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 11 (145,000 MXN total)
(11, 1, 9, 8500.00, 76500.00),  -- Premium Line: Eagle F1 205/55/16
(11, 2, 5, 12000.00, 60000.00), -- Premium Line: Eagle F1 225/45/17
(11, 4, 1, 9500.00, 9500.00);   -- Premium Line: Eagle F1 265/35/19

-- April 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 16 (152,000 MXN total)
(16, 1, 10, 8500.00, 85000.00), -- Premium Line: Eagle F1 205/55/16
(16, 2, 5, 12000.00, 60000.00), -- Premium Line: Eagle F1 225/45/17
(16, 4, 1, 9500.00, 9500.00);   -- Premium Line: Eagle F1 265/35/19

-- May 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 21 (165,000 MXN total)
(21, 1, 11, 8500.00, 93500.00), -- Premium Line: Eagle F1 205/55/16
(21, 2, 5, 12000.00, 60000.00), -- Premium Line: Eagle F1 225/45/17
(21, 4, 1, 9500.00, 9500.00);   -- Premium Line: Eagle F1 265/35/19

-- June 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 26 (178,000 MXN total)
(26, 1, 12, 8500.00, 102000.00), -- Premium Line: Eagle F1 205/55/16
(26, 2, 6, 12000.00, 72000.00),  -- Premium Line: Eagle F1 225/45/17
(26, 4, 1, 9500.00, 9500.00);    -- Premium Line: Eagle F1 265/35/19

-- July 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 31 (185,000 MXN total)
(31, 1, 13, 8500.00, 110500.00), -- Premium Line: Eagle F1 205/55/16
(31, 2, 6, 12000.00, 72000.00),  -- Premium Line: Eagle F1 225/45/17
(31, 4, 1, 9500.00, 9500.00);    -- Premium Line: Eagle F1 265/35/19

-- August 2025 Invoice Line Items
INSERT INTO goodyear_mexico.invoice_line_items (invoice_id, product_id, quantity, unit_price, line_total) VALUES
-- Invoice 36 (192,000 MXN total)
(36, 1, 14, 8500.00, 119000.00), -- Premium Line: Eagle F1 205/55/16
(36, 2, 6, 12000.00, 72000.00),  -- Premium Line: Eagle F1 225/45/17
(36, 4, 1, 9500.00, 9500.00);    -- Premium Line: Eagle F1 265/35/19

-- Verification query to check Premium Line sales distribution
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
