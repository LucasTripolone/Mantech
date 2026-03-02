CREATE TABLE roles (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Roles iniciales del sistema
INSERT INTO roles (name) VALUES
    ('OPERARIO'),
    ('SUPERVISOR'),
    ('MANTENIMIENTO'),
    ('JEFE_PLANTA');
