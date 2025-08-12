-- Add Goodyear Mexico salespeople as participants in incentiva database
-- Connect to main database
\c incentiva_dev;

-- Add 10 salespeople as participants with password 'exatatech'
INSERT INTO users (id, email, "firstName", "lastName", role, "createdAt", "updatedAt") VALUES
('user_goodyear_001', 'carlos.rodriguez@goodyear.mx', 'Carlos', 'Rodriguez', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_002', 'ana.garcia@goodyear.mx', 'Ana', 'Garcia', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_003', 'miguel.lopez@goodyear.mx', 'Miguel', 'Lopez', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_004', 'sofia.martinez@goodyear.mx', 'Sofia', 'Martinez', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_005', 'javier.hernandez@goodyear.mx', 'Javier', 'Hernandez', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_006', 'carmen.flores@goodyear.mx', 'Carmen', 'Flores', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_007', 'roberto.diaz@goodyear.mx', 'Roberto', 'Diaz', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_008', 'patricia.moreno@goodyear.mx', 'Patricia', 'Moreno', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_009', 'fernando.jimenez@goodyear.mx', 'Fernando', 'Jimenez', 'PARTICIPANT', NOW(), NOW()),
('user_goodyear_010', 'isabel.torres@goodyear.mx', 'Isabel', 'Torres', 'PARTICIPANT', NOW(), NOW());

-- Verify participants were added
SELECT COUNT(*) as total_participants FROM users WHERE role = 'PARTICIPANT';
SELECT email, "firstName", "lastName", role FROM users WHERE role = 'PARTICIPANT' ORDER BY "firstName";
