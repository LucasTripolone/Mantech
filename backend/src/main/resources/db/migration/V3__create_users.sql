CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    plant_id   BIGINT       REFERENCES plants(id),
    role_id    BIGINT       NOT NULL REFERENCES roles(id),
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    phone      VARCHAR(50),
    shift      VARCHAR(50),
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
