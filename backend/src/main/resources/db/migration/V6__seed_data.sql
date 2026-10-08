-- Planta de ejemplo
INSERT INTO plants (name, location) VALUES
    ('Planta Principal', 'Buenos Aires, Argentina');

-- NOTA: el usuario admin (admin@mantech.com) lo crea DataSeeder.java, con la
--       contrasena que venga en SEED_ADMIN_PASSWORD.
-- usando el PasswordEncoder de la app, para garantizar que el hash coincida con la
-- contrasena documentada. No se inserta aca para evitar un hash inconsistente.

-- Maquinas de ejemplo
INSERT INTO machines (plant_id, name, qr_code, sector, criticality) VALUES
    (1, 'Prensa #14',     'QR-PRENSA-14',   'Linea de Produccion 1', 'ALTA'),
    (1, 'Mezcladora B1',  'QR-MEZC-B1',     'Linea de Produccion 2', 'MEDIA'),
    (1, 'Grua Puente C3', 'QR-GRUA-C3',     'Almacen',               'ALTA');
