CREATE TABLE preventive_plans (
    id                         BIGSERIAL PRIMARY KEY,
    machine_id                 BIGINT       NOT NULL REFERENCES machines(id),
    assigned_technician_id     BIGINT       REFERENCES users(id),
    title                      VARCHAR(255) NOT NULL,
    description                VARCHAR(1000),
    frequency_type             VARCHAR(20)  NOT NULL,   -- DIAS, SEMANAS, MESES
    frequency_value            INTEGER      NOT NULL,
    estimated_duration_minutes INTEGER,
    next_due_at                TIMESTAMP    NOT NULL,
    last_generated_at          TIMESTAMP,
    active                     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at                 TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preventive_plans_machine ON preventive_plans(machine_id);
CREATE INDEX idx_preventive_plans_due     ON preventive_plans(next_due_at);
