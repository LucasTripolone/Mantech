CREATE TABLE reports (
    id                   BIGSERIAL PRIMARY KEY,
    machine_id           BIGINT        NOT NULL REFERENCES machines(id),
    reported_by_user_id  BIGINT        NOT NULL REFERENCES users(id),
    type                 VARCHAR(50)   NOT NULL,   -- FALLA, PREVENTIVO, RUTINA
    description          VARCHAR(1000),
    priority             VARCHAR(50),              -- ALTA, MEDIA, BAJA
    status               VARCHAR(50)   NOT NULL DEFAULT 'PENDIENTE',  -- PENDIENTE, EN_PROCESO, RESUELTO
    created_at           TIMESTAMP     NOT NULL DEFAULT NOW(),
    resolved_at          TIMESTAMP
);

CREATE TABLE report_files (
    id         BIGSERIAL PRIMARY KEY,
    report_id  BIGINT       NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    file_type  VARCHAR(50)  NOT NULL,   -- PHOTO, AUDIO
    file_url   VARCHAR(500) NOT NULL
);
