-- Planta de ejemplo
INSERT INTO plants (name, location) VALUES
    ('Planta Principal', 'Buenos Aires, Argentina');

-- Usuario admin de prueba
-- password: mantech123 (BCrypt)
INSERT INTO users (plant_id, role_id, first_name, last_name, email, password, shift, active)
VALUES (1, 4, 'Admin', 'Mantech', 'admin@mantech.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'MANANA', TRUE);

-- Maquinas de ejemplo
INSERT INTO machines (plant_id, name, qr_code, sector, criticality) VALUES
    (1, 'Prensa #14',     'QR-PRENSA-14',   'Linea de Produccion 1', 'ALTA'),
    (1, 'Mezcladora B1',  'QR-MEZC-B1',     'Linea de Produccion 2', 'MEDIA'),
    (1, 'Grua Puente C3', 'QR-GRUA-C3',     'Almacen',               'ALTA');
