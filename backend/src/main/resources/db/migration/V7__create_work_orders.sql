CREATE TABLE work_orders (
    id                      BIGSERIAL PRIMARY KEY,
    plant_id                BIGINT        REFERENCES plants(id),
    machine_id              BIGINT        NOT NULL REFERENCES machines(id),
    report_id               BIGINT        REFERENCES reports(id),
    created_by_user_id      BIGINT        NOT NULL REFERENCES users(id),
    assigned_technician_id  BIGINT        REFERENCES users(id),
    type                    VARCHAR(20)   NOT NULL,   -- CORRECTIVA, PREVENTIVA
    status                  VARCHAR(20)   NOT NULL DEFAULT 'ABIERTA',
                                          -- ABIERTA, ASIGNADA, EN_PROCESO, PAUSADA, CERRADA, CANCELADA
    priority                VARCHAR(20),              -- ALTA, MEDIA, BAJA
    description             VARCHAR(1000),
    failure_type            VARCHAR(100),
    impact                  VARCHAR(20),              -- ALTO, MEDIO, BAJO
    stopped_production      BOOLEAN       NOT NULL DEFAULT FALSE,
    scheduled_at            TIMESTAMP,
    started_at              TIMESTAMP,                -- Bloque 4: CRÍTICO para KPIs
    finished_at             TIMESTAMP,                -- Bloque 4: CRÍTICO para KPIs
    resolution_notes        VARCHAR(1000),
    signature               VARCHAR(255),
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_orders_machine      ON work_orders(machine_id);
CREATE INDEX idx_work_orders_status       ON work_orders(status);
CREATE INDEX idx_work_orders_type         ON work_orders(type);
CREATE INDEX idx_work_orders_technician   ON work_orders(assigned_technician_id);
