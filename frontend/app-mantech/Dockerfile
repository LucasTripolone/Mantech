# ---- Stage 1: Build (Expo web export estático) ----
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (cacheable mientras el lockfile no cambie)
COPY package.json package-lock.json ./
RUN npm ci

# URL del backend: se inyecta en el bundle en build-time.
# Railway pasa la variable del servicio como build arg si está declarada acá.
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

# Copiar el código y exportar el sitio web estático a /app/dist
COPY . .
RUN npx expo export --platform web

# ---- Stage 2: Run (servidor estático liviano) ----
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

# Railway inyecta PORT; en local cae a 8080.
ENV PORT=8080
EXPOSE 8080

# 'serve' respeta el export estático multi-página de expo-router (clean URLs).
CMD ["sh", "-c", "serve dist -l ${PORT:-8080}"]
