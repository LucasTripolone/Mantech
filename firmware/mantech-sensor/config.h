// ============================================================================
//  Mantech Latam — Configuración del sensor de campo
//
//  Este es el ÚNICO archivo que tenés que editar.
//  Completá los cuatro valores de abajo y grabá la placa.
// ============================================================================

#ifndef MANTECH_CONFIG_H
#define MANTECH_CONFIG_H

// ---------------------------------------------------------------------------
//  1) Red WiFi
//     El ESP32 sólo se conecta a redes de 2,4 GHz. Si tu router emite 2,4 y 5
//     GHz con el mismo nombre, puede que no la encuentre: en ese caso usá el
//     nombre de la red de 2,4 GHz o el punto de acceso del celular.
// ---------------------------------------------------------------------------
#define WIFI_SSID      "PONE_ACA_EL_NOMBRE_DE_TU_WIFI"
#define WIFI_PASSWORD  "PONE_ACA_LA_CLAVE_DE_TU_WIFI"

// ---------------------------------------------------------------------------
//  2) Servidor Mantech
//     Dejalo como está salvo que uses otro entorno.
// ---------------------------------------------------------------------------
#define MANTECH_API_URL "https://api.mantech.lat"

// ---------------------------------------------------------------------------
//  3) Clave del dispositivo
//     Identifica a esta placa frente al servidor. Te la paso junto con el
//     resto de credenciales; también figura en las variables de Railway.
// ---------------------------------------------------------------------------
#define MANTECH_DEVICE_KEY "PONE_ACA_LA_CLAVE_DEL_DISPOSITIVO"

// ---------------------------------------------------------------------------
//  4) Pines (sólo cambialos si cableaste distinto)
// ---------------------------------------------------------------------------
#define PIN_DS18B20   4    // DATA del sensor de temperatura (1-Wire)
#define PIN_I2C_SDA   21   // SDA del MPU6050
#define PIN_I2C_SCL   22   // SCL del MPU6050
#define PIN_LED       2    // LED azul de la placa, para ver el estado

// ---------------------------------------------------------------------------
//  Ajustes finos (no hace falta tocarlos)
// ---------------------------------------------------------------------------

// Cada cuánto enviar, en segundos. El servidor puede cambiarlo y la placa
// obedece: este valor es sólo el de arranque.
#define SEND_INTERVAL_SECONDS 10

// Cuántas muestras del acelerómetro se promedian para medir vibración.
// Más muestras = lectura más estable, pero cada ciclo tarda un poco más.
#define VIBRATION_SAMPLES 200

// Versión de firmware que se reporta al servidor.
#define FIRMWARE_VERSION "1.0.0"

// Poné en 1 para que el monitor serie muestre cada lectura y cada envío.
#define DEBUG_SERIAL 1

// Validar la identidad del servidor contra los certificados de certs.h.
// Dejalo en 1. Ponelo en 0 sólo si la placa deja de conectar después de que
// el servidor cambie de certificado: con 0 el tráfico sigue cifrado, pero no
// se verifica con quién se está hablando.
#define USE_TLS_VALIDATION 1

#endif  // MANTECH_CONFIG_H
