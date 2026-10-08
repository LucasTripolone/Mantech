# Landing estática de Mantech (HTML + imágenes), servida con `serve`.
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve@14

COPY index.html estado.html ./
COPY assets ./assets
COPY qr ./qr

# Railway inyecta PORT; en local cae a 8080.
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve . -l ${PORT:-8080}"]
