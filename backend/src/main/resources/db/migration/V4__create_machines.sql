CREATE TABLE machines (
    id          BIGSERIAL PRIMARY KEY,
    plant_id    BIGINT       NOT NULL REFERENCES plants(id),
    name        VARCHAR(255) NOT NULL,
    qr_code     VARCHAR(255) NOT NULL UNIQUE,
    sector      VARCHAR(255),
    criticality VARCHAR(50),   -- ALTA, MEDIA, BAJA
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_status_history (
    id                  BIGSERIAL PRIMARY KEY,
    machine_id          BIGINT       NOT NULL REFERENCES machines(id),
    changed_by_user_id  BIGINT       NOT NULL REFERENCES users(id),
    status              VARCHAR(50)  NOT NULL,  -- OPERATIVA, PREVENTIVO, FALLA
    reason              VARCHAR(500),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
