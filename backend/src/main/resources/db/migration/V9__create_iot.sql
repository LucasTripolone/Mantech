-- Capa IoT: dispositivos de campo (ESP32) y las lecturas que envían.
--
-- Un dispositivo se identifica con una clave propia (device_key) que viaja en
-- cada envío. No usa JWT: el firmware de un microcontrolador no debe manejar
-- login ni refresco de tokens.

CREATE TABLE iot_devices (
    id               BIGSERIAL PRIMARY KEY,
    machine_id       BIGINT       REFERENCES machines(id),
    name             VARCHAR(255) NOT NULL,
    device_key       VARCHAR(80)  NOT NULL UNIQUE,
    description      VARCHAR(500),
    firmware_version VARCHAR(50),
    -- Cada cuántos segundos debe reportar. El servidor se lo devuelve en cada
    -- respuesta, así se puede cambiar el ritmo sin reprogramar la placa.
    interval_seconds INTEGER      NOT NULL DEFAULT 10,
    active           BOOLEAN      NOT NULL DEFAULT TRUE,
    last_seen_at     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_iot_devices_machine ON iot_devices(machine_id);

CREATE TABLE sensor_readings (
    id          BIGSERIAL        PRIMARY KEY,
    device_id   BIGINT           NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
    machine_id  BIGINT           REFERENCES machines(id),
    metric      VARCHAR(30)      NOT NULL,  -- TEMPERATURA, VIBRACION, INCLINACION
    value       DOUBLE PRECISION NOT NULL,
    unit        VARCHAR(16)      NOT NULL,  -- C, g, deg
    status      VARCHAR(16)      NOT NULL,  -- NORMAL, ALERTA, CRITICO
    recorded_at TIMESTAMP        NOT NULL,
    created_at  TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- El patrón de lectura es siempre "lo último de esta máquina y esta magnitud".
CREATE INDEX idx_sensor_readings_machine_metric
    ON sensor_readings(machine_id, metric, recorded_at DESC);
CREATE INDEX idx_sensor_readings_device
    ON sensor_readings(device_id, recorded_at DESC);
-- Para la limpieza por antigüedad.
CREATE INDEX idx_sensor_readings_recorded
    ON sensor_readings(recorded_at);

-- Dominios cerrados: una métrica mal escrita desaparecería de los cálculos
-- sin producir ningún error.
ALTER TABLE sensor_readings
    ADD CONSTRAINT chk_reading_metric CHECK (metric IN ('TEMPERATURA', 'VIBRACION', 'INCLINACION')),
    ADD CONSTRAINT chk_reading_status CHECK (status IN ('NORMAL', 'ALERTA', 'CRITICO'));
