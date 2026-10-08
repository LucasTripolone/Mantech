# Despliegue de Mantech

## 1. Desarrollo local (sin Docker)

Requisitos: **Java 21**, **Maven**, **PostgreSQL** corriendo en `localhost:5432`.

```powershell
# 1. Crear la base (una sola vez)
psql -U postgres -c "CREATE DATABASE mantech_db;"

# 2. Levantar el backend
cd backend
./mvnw spring-boot:run        # o: mvn spring-boot:run
```

La API queda en `http://localhost:8080`. Al arrancar, Flyway crea el esquema
(migraciones `V1`–`V9`) y `DataSeeder` carga datos demo.

**Usuarios demo:** `admin@mantech.com` (jefe de planta) y `tecnico@mantech.com`
(mantenimiento).

Las contraseñas **no están en el repositorio**: se definen con las variables
`SEED_ADMIN_PASSWORD` y `SEED_TECH_PASSWORD`. Si no las definís, el seeder
genera una al azar y la escribe en el log de arranque — buscá la línea
`No hay contrasena configurada para ...`.

Config por defecto (`application.properties`), sobreescribible por variables de entorno:

| Variable | Default local |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/mantech_db` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` |
| `JWT_SECRET` | (valor de dev en el .properties) |
| `SEED_ADMIN_PASSWORD` | sin default: si falta, se genera y se loguea |
| `SEED_TECH_PASSWORD` | sin default: si falta, se genera y se loguea |
| `IOT_DEVICE_KEY` | clave del sensor de campo; si falta, se genera y se loguea |
| `PORT` | `8080` |

---

## 2. Local con Docker Compose (opcional)

Levanta Postgres + backend juntos:

```bash
docker compose up --build
```

---

## 3. Despliegue en Railway

El backend se despliega **desde el Dockerfile** (`backend/Dockerfile`).
Config de build en `backend/railway.json`.

### Pasos

1. **Crear proyecto** en Railway y conectar este repo de GitHub.
2. **Agregar plugin PostgreSQL** (New → Database → PostgreSQL). Railway expone
   automáticamente `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
3. **Crear el servicio del backend** apuntando al subdirectorio `backend/`
   (Settings → Root Directory = `backend`). Railway detecta el `Dockerfile`.
4. **Variables de entorno** del servicio backend (Settings → Variables):

   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
   SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
   SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
   JWT_SECRET=<generar uno nuevo, p.ej. openssl rand -hex 32>
   JWT_EXPIRATION=86400000
   ```

   > `PORT` lo inyecta Railway solo; el backend ya bindea a `${PORT}`.

5. **Deploy.** Flyway corre las migraciones contra la base de Railway en el
   primer arranque.

### Notas de producción (pendientes antes de salir a prod)
- Eliminar `DevAuthController` (`/api/auth/dev/reset-password`) — endpoint abierto de reset.
- Restringir CORS en `SecurityConfig` a los dominios reales (hoy está `*` para dev).
- Mover los uploads de archivos a almacenamiento externo (S3/Railway volume),
  no al filesystem efímero del contenedor.
- Rotar `JWT_SECRET` y no commitearlo.
