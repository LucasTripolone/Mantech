// ============================================================================
//  Mantech Latam — Sensor de campo (ESP32)
//
//  Mide temperatura, vibración e inclinación de una máquina y las envía al
//  servidor de Mantech, que las muestra en vivo en la app.
//
//  NO HACE FALTA EDITAR ESTE ARCHIVO. Toda la configuración está en config.h.
//
//  Hardware:
//    - ESP32 DevKit
//    - DS18B20  (temperatura, 1-Wire)  -> PIN_DS18B20 + resistencia 4,7 kΩ
//    - MPU6050  (acelerómetro, I2C)    -> PIN_I2C_SDA / PIN_I2C_SCL
//
//  Librerías a instalar desde el Gestor de Librerías del IDE de Arduino:
//    - "OneWire"           (Paul Stoffregen)
//    - "DallasTemperature" (Miles Burton)
//  El MPU6050 se lee directo por I2C, así que no necesita librería.
// ============================================================================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <math.h>
#include <time.h>

#include "config.h"
#include "certs.h"

// ---------------------------------------------------------------------------
//  MPU6050: registros
// ---------------------------------------------------------------------------
static const uint8_t MPU_ADDR_PRIMARY   = 0x68;  // AD0 a GND (lo habitual)
static const uint8_t MPU_ADDR_SECONDARY = 0x69;  // AD0 a 3,3 V
static const uint8_t REG_PWR_MGMT_1     = 0x6B;
static const uint8_t REG_ACCEL_CONFIG   = 0x1C;
static const uint8_t REG_ACCEL_XOUT_H   = 0x3B;
static const uint8_t REG_WHO_AM_I       = 0x75;

// Con el rango de ±2 g, el sensor entrega 16384 cuentas por g.
static const float ACCEL_SCALE_LSB_PER_G = 16384.0f;

// ---------------------------------------------------------------------------
//  Estado global
// ---------------------------------------------------------------------------
OneWire oneWire(PIN_DS18B20);
DallasTemperature dallas(&oneWire);

uint8_t  mpuAddress   = 0;      // 0 = no se encontró el MPU6050
bool     hasDS18B20   = false;
uint32_t sendInterval = SEND_INTERVAL_SECONDS;
uint32_t lastSendMs   = 0;

#if DEBUG_SERIAL
  #define LOG(...)   Serial.printf(__VA_ARGS__)
  #define LOGLN(x)   Serial.println(x)
#else
  #define LOG(...)
  #define LOGLN(x)
#endif

// ---------------------------------------------------------------------------
//  LED de estado
//
//  1 parpadeo  = envío correcto
//  2 parpadeos = el servidor rechazó el envío (clave equivocada, por ejemplo)
//  3 parpadeos = no hay WiFi
//  Encendido fijo durante el arranque.
// ---------------------------------------------------------------------------
void blink(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(120);
    digitalWrite(PIN_LED, LOW);
    delay(120);
  }
}

// ---------------------------------------------------------------------------
//  MPU6050 por I2C directo
// ---------------------------------------------------------------------------
bool mpuWrite(uint8_t addr, uint8_t reg, uint8_t value) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

bool mpuProbe(uint8_t addr) {
  Wire.beginTransmission(addr);
  Wire.write(REG_WHO_AM_I);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)addr, 1) != 1) return false;
  uint8_t who = Wire.read();
  // Los MPU6050 responden 0x68; algunos clones devuelven 0x70, 0x72 o 0x98.
  return who != 0x00 && who != 0xFF;
}

bool mpuBegin() {
  uint8_t candidates[2] = { MPU_ADDR_PRIMARY, MPU_ADDR_SECONDARY };
  for (uint8_t i = 0; i < 2; i++) {
    if (mpuProbe(candidates[i])) {
      mpuAddress = candidates[i];
      mpuWrite(mpuAddress, REG_PWR_MGMT_1, 0x00);    // despertar
      delay(100);
      mpuWrite(mpuAddress, REG_ACCEL_CONFIG, 0x00);  // rango ±2 g
      delay(50);
      LOG("MPU6050 detectado en 0x%02X\n", mpuAddress);
      return true;
    }
  }
  LOGLN("MPU6050 NO detectado. Revisá SDA, SCL, 3V3 y GND.");
  return false;
}

/** Lee aceleración en g de los tres ejes. */
bool mpuReadAccel(float &ax, float &ay, float &az) {
  if (mpuAddress == 0) return false;

  Wire.beginTransmission(mpuAddress);
  Wire.write(REG_ACCEL_XOUT_H);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((int)mpuAddress, 6) != 6) return false;

  int16_t rawX = (Wire.read() << 8) | Wire.read();
  int16_t rawY = (Wire.read() << 8) | Wire.read();
  int16_t rawZ = (Wire.read() << 8) | Wire.read();

  ax = rawX / ACCEL_SCALE_LSB_PER_G;
  ay = rawY / ACCEL_SCALE_LSB_PER_G;
  az = rawZ / ACCEL_SCALE_LSB_PER_G;
  return true;
}

// ---------------------------------------------------------------------------
//  Medición
// ---------------------------------------------------------------------------

/**
 * Vibración e inclinación en una sola pasada.
 *
 * Vibración: se toman muchas muestras seguidas, se calcula el promedio de cada
 * eje —que es la gravedad, o sea la parte quieta— y se mide cuánto se aparta
 * cada muestra de ese promedio. Ese desvío (RMS) es la vibración real, sin la
 * gravedad metida adentro.
 *
 * Inclinación: ángulo entre el vector de gravedad promedio y la vertical. Si la
 * placa está horizontal da 0°; acostada, 90°.
 */
bool measureMotion(float &vibrationG, float &tiltDegrees) {
  if (mpuAddress == 0) return false;

  float sumX = 0, sumY = 0, sumZ = 0;
  static float bufX[VIBRATION_SAMPLES];
  static float bufY[VIBRATION_SAMPLES];
  static float bufZ[VIBRATION_SAMPLES];

  int n = 0;
  for (int i = 0; i < VIBRATION_SAMPLES; i++) {
    float ax, ay, az;
    if (!mpuReadAccel(ax, ay, az)) continue;
    bufX[n] = ax; bufY[n] = ay; bufZ[n] = az;
    sumX += ax;   sumY += ay;   sumZ += az;
    n++;
    delayMicroseconds(1000);  // ~1 kHz de muestreo
  }
  if (n < 10) return false;

  float meanX = sumX / n, meanY = sumY / n, meanZ = sumZ / n;

  // Desvío cuadrático medio respecto del promedio: la parte que vibra.
  float acc = 0;
  for (int i = 0; i < n; i++) {
    float dx = bufX[i] - meanX;
    float dy = bufY[i] - meanY;
    float dz = bufZ[i] - meanZ;
    acc += dx * dx + dy * dy + dz * dz;
  }
  vibrationG = sqrtf(acc / n);

  // Ángulo respecto de la vertical, a partir de la gravedad promedio.
  float magnitude = sqrtf(meanX * meanX + meanY * meanY + meanZ * meanZ);
  if (magnitude < 0.1f) {
    tiltDegrees = 0;
  } else {
    float cosine = fabsf(meanZ) / magnitude;
    if (cosine > 1.0f) cosine = 1.0f;
    tiltDegrees = acosf(cosine) * 180.0f / PI;
  }
  return true;
}

/** Temperatura en °C, o NAN si el sensor no responde. */
float measureTemperature() {
  if (!hasDS18B20) return NAN;
  dallas.requestTemperatures();
  float c = dallas.getTempCByIndex(0);
  // La librería devuelve -127 cuando el sensor no contesta.
  if (c <= -100.0f || c >= 150.0f) return NAN;
  return c;
}

// ---------------------------------------------------------------------------
//  Red
// ---------------------------------------------------------------------------
bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;

  LOG("Conectando a WiFi '%s'", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    LOG(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    LOG("\nWiFi conectado. IP: %s\n", WiFi.localIP().toString().c_str());
    return true;
  }
  LOGLN("\nNo se pudo conectar al WiFi.");
  return false;
}

/**
 * Pone el reloj en hora por NTP.
 *
 * Es imprescindible para validar el certificado del servidor: el ESP32 arranca
 * creyendo que es 1970, y con esa fecha cualquier certificado parece "todavía
 * no válido", así que toda conexión fallaría.
 */
bool syncClock() {
#if USE_TLS_VALIDATION
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  LOG("Poniendo el reloj en hora");
  time_t now = 0;
  uint32_t start = millis();
  // Cualquier fecha posterior a 2021 alcanza para saber que ya sincronizó.
  while (now < 1609459200 && millis() - start < 15000) {
    delay(400);
    LOG(".");
    now = time(nullptr);
  }
  if (now < 1609459200) {
    LOGLN("\nNo se pudo sincronizar la hora. La validación del certificado va a fallar.");
    LOGLN("Si el problema persiste, poné USE_TLS_VALIDATION en 0 dentro de config.h.");
    return false;
  }
  LOG("\nReloj en hora (UTC): %s", ctime(&now));
  return true;
#else
  return true;
#endif
}

/**
 * Envía las lecturas al servidor.
 *
 * El cuerpo se arma a mano con snprintf en vez de usar una librería de JSON:
 * son tres valores de formato fijo y así hay una dependencia menos que
 * instalar.
 */
bool clockReady = false;

bool sendReadings(float tempC, float vibrationG, float tiltDegrees, bool hasMotion) {
  if (!ensureWifi()) {
    blink(3);
    return false;
  }
  // Tras una reconexión el reloj puede haber quedado sin hora; sin hora válida
  // la validación del certificado falla.
  if (!clockReady) {
    clockReady = syncClock();
  }

  char body[512];
  char samples[384];
  samples[0] = '\0';
  bool first = true;

  if (!isnan(tempC)) {
    char part[128];
    snprintf(part, sizeof(part),
             "%s{\"metric\":\"TEMPERATURA\",\"value\":%.2f,\"unit\":\"C\"}",
             first ? "" : ",", tempC);
    strncat(samples, part, sizeof(samples) - strlen(samples) - 1);
    first = false;
  }
  if (hasMotion) {
    char part[128];
    snprintf(part, sizeof(part),
             "%s{\"metric\":\"VIBRACION\",\"value\":%.4f,\"unit\":\"g\"}",
             first ? "" : ",", vibrationG);
    strncat(samples, part, sizeof(samples) - strlen(samples) - 1);
    first = false;

    snprintf(part, sizeof(part),
             ",{\"metric\":\"INCLINACION\",\"value\":%.2f,\"unit\":\"deg\"}",
             tiltDegrees);
    strncat(samples, part, sizeof(samples) - strlen(samples) - 1);
  }

  if (samples[0] == '\0') {
    LOGLN("No hay ninguna lectura válida para enviar; se omite el ciclo.");
    blink(2);
    return false;
  }

  snprintf(body, sizeof(body),
           "{\"firmwareVersion\":\"%s\",\"uptimeSeconds\":%lu,\"readings\":[%s]}",
           FIRMWARE_VERSION, (unsigned long)(millis() / 1000), samples);

  WiFiClientSecure client;
#if USE_TLS_VALIDATION
  // Se valida la identidad del servidor contra las raíces de certs.h: sin esto
  // cualquiera en la misma red podría hacerse pasar por el servidor de Mantech
  // y quedarse con las mediciones.
  client.setCACert(MANTECH_ROOT_CA);
#else
  // Modo degradado: el tráfico viaja cifrado pero no se verifica con quién se
  // está hablando. Ver USE_TLS_VALIDATION en config.h.
  client.setInsecure();
#endif

  HTTPClient http;
  String url = String(MANTECH_API_URL) + "/api/iot/ingest/readings";
  if (!http.begin(client, url)) {
    LOGLN("No se pudo iniciar la conexión HTTP.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", MANTECH_DEVICE_KEY);
  http.setTimeout(10000);

  int code = http.POST((uint8_t *)body, strlen(body));
  String response = code > 0 ? http.getString() : String();
  http.end();

  if (code == 200) {
    LOG("Enviado OK. Respuesta: %s\n", response.c_str());
    // El servidor manda el intervalo con el que quiere recibir datos, así se
    // puede cambiar el ritmo sin volver a grabar la placa.
    int idx = response.indexOf("\"intervalSeconds\":");
    if (idx >= 0) {
      int parsed = response.substring(idx + 18).toInt();
      if (parsed >= 2 && parsed <= 3600 && (uint32_t)parsed != sendInterval) {
        sendInterval = parsed;
        LOG("El servidor pidió reportar cada %u segundos.\n", sendInterval);
      }
    }
    blink(1);
    return true;
  }

  LOG("Error al enviar. Código HTTP: %d. Respuesta: %s\n", code, response.c_str());
  if (code == 401 || code == 403) {
    LOGLN(">> La clave del dispositivo no es válida. Revisá MANTECH_DEVICE_KEY en config.h.");
  }
  blink(2);
  return false;
}

// ---------------------------------------------------------------------------
//  Arranque y ciclo principal
// ---------------------------------------------------------------------------
void setup() {
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, HIGH);

#if DEBUG_SERIAL
  Serial.begin(115200);
  delay(600);
#endif

  LOGLN("");
  LOGLN("=====================================");
  LOGLN(" Mantech Latam - Sensor de campo");
  LOG(  " Firmware %s\n", FIRMWARE_VERSION);
  LOGLN("=====================================");

  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(400000);
  mpuBegin();

  dallas.begin();
  hasDS18B20 = dallas.getDeviceCount() > 0;
  if (hasDS18B20) {
    dallas.setResolution(11);  // 0,125 °C, bastante más rápido que 12 bits
    LOG("DS18B20 detectado (%d sensor/es).\n", dallas.getDeviceCount());
  } else {
    LOGLN("DS18B20 NO detectado. Revisá DATA, la resistencia de 4,7 kΩ, 3V3 y GND.");
  }

  if (!hasDS18B20 && mpuAddress == 0) {
    LOGLN("");
    LOGLN("No se detectó ningún sensor. Revisá el cableado y reiniciá la placa.");
  }

  if (ensureWifi()) {
    clockReady = syncClock();
  }
  digitalWrite(PIN_LED, LOW);

  // Primer envío inmediato, para ver enseguida si la cadena completa funciona.
  lastSendMs = millis() - (sendInterval * 1000UL);
}

void loop() {
  uint32_t now = millis();
  if (now - lastSendMs < sendInterval * 1000UL) {
    delay(50);
    return;
  }
  lastSendMs = now;

  float tempC = measureTemperature();

  float vibrationG = 0, tiltDegrees = 0;
  bool hasMotion = measureMotion(vibrationG, tiltDegrees);

#if DEBUG_SERIAL
  Serial.println("---------------------------------------");
  if (isnan(tempC)) Serial.println("Temperatura : sin lectura");
  else              Serial.printf("Temperatura : %.2f C\n", tempC);
  if (hasMotion) {
    Serial.printf("Vibración   : %.4f g\n", vibrationG);
    Serial.printf("Inclinación : %.2f grados\n", tiltDegrees);
  } else {
    Serial.println("Movimiento  : sin lectura");
  }
#endif

  sendReadings(tempC, vibrationG, tiltDegrees, hasMotion);

  // Si un sensor no estaba al encender, se reintenta detectarlo: así alcanza
  // con enchufarlo, sin reiniciar la placa.
  if (!hasDS18B20) {
    dallas.begin();
    hasDS18B20 = dallas.getDeviceCount() > 0;
    if (hasDS18B20) LOGLN("DS18B20 detectado en caliente.");
  }
  if (mpuAddress == 0) {
    mpuBegin();
  }
}
