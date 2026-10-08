# Sensor de campo Mantech — Guía de armado

Todo lo que necesitás para pasar de la caja de componentes a ver los datos en
`app.mantech.lat`. Está pensada para alguien que no trabajó nunca con
electrónica: si seguís los pasos en orden, no hay nada que decidir.

**Tiempo estimado:** 40 minutos la primera vez.

---

## 1. Qué vas a armar

```
   DS18B20 (temperatura)                MPU6050 (vibración)
        │ 1-Wire                             │ I²C
        └──────────────┐      ┌──────────────┘
                       ▼      ▼
                   ┌────────────────┐
                   │     ESP32      │
                   └───────┬────────┘
                           │ WiFi (HTTPS)
                           ▼
                  api.mantech.lat  ──►  app.mantech.lat
```

El ESP32 mide cada 10 segundos y manda los valores al servidor. La app los
muestra en la pantalla **Sensores**, que se refresca sola.

---

## 2. Cableado

> **Regla de oro:** desenchufá el ESP32 del USB antes de cambiar cualquier
> cable. Conectar con la placa encendida es la forma más común de quemar un
> sensor.

### DS18B20 — temperatura

El sensor sumergible trae tres cables. Si los colores no coinciden con los de
abajo, guiate por la hoja del fabricante.

| Cable del sensor | Va a |
|---|---|
| Rojo (VCC) | **3V3** del ESP32 |
| Negro (GND) | **GND** del ESP32 |
| Amarillo o blanco (DATA) | **GPIO 4** del ESP32 |

**La resistencia de 4,7 kΩ es obligatoria.** Va entre el cable de datos y el de
alimentación, no en serie:

```
   3V3 ──┬──────────── Rojo (VCC)
         │
        [ ] 4,7 kΩ
         │
  GPIO 4 ┴──────────── Amarillo (DATA)

   GND ───────────────  Negro (GND)
```

En la protoboard: poné el rojo y una pata de la resistencia en la misma fila;
el amarillo y la otra pata de la resistencia, en otra fila; de esa segunda fila
sale el cable a GPIO 4.

Si tu DS18B20 viene montado en una plaquita, puede que ya traiga la resistencia
incorporada — en ese caso no agregues otra.

### MPU6050 — vibración e inclinación

| Pin del MPU6050 | Va a |
|---|---|
| VCC | **3V3** del ESP32 |
| GND | **GND** del ESP32 |
| SDA | **GPIO 21** |
| SCL | **GPIO 22** |
| XDA, XCL, AD0, INT | se dejan sin conectar |

> **Importante:** alimentá el MPU6050 con **3V3, no con 5V**. La mayoría de los
> módulos tolera 5V, pero el ESP32 trabaja a 3,3 V y así evitás problemas.

### Alimentación

El ESP32 se alimenta por su puerto USB con la fuente de 5 V / 2 A. Durante el
armado y las pruebas podés usar el cable USB de la computadora.

---

## 3. Preparar el IDE de Arduino

1. Descargá e instalá el **IDE de Arduino 2.x** desde `arduino.cc/en/software`.
2. Agregá el soporte para ESP32:
   - *Archivo → Preferencias → Gestor de URLs adicionales de tarjetas*, pegá:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - *Herramientas → Placa → Gestor de tarjetas*, buscá **esp32** e instalá el
     paquete de Espressif Systems.
3. Instalá las dos librerías necesarias desde *Herramientas → Gestionar
   bibliotecas*:
   - **OneWire** (de Paul Stoffregen)
   - **DallasTemperature** (de Miles Burton)

   El MPU6050 se lee directo por I²C, así que no necesita librería.

---

## 4. Cargar el firmware

1. Abrí `firmware/mantech-sensor/mantech-sensor.ino` con el IDE de Arduino.
   El archivo `config.h` se abre solo, en otra pestaña.
2. En **config.h** completá los tres valores:
   - `WIFI_SSID` y `WIFI_PASSWORD` — tu red **de 2,4 GHz**. El ESP32 no se
     conecta a redes de 5 GHz.
   - `MANTECH_DEVICE_KEY` — la clave del dispositivo (te la paso aparte; está
     también en las variables de Railway como `IOT_DEVICE_KEY`).
3. Conectá el ESP32 por USB.
4. En *Herramientas → Placa* elegí **ESP32 Dev Module**.
5. En *Herramientas → Puerto* elegí el puerto COM que aparezca al enchufar la
   placa. Si no aparece ninguno, instalá el driver **CP2102** de Silicon Labs.
6. Apretá **Subir** (la flecha →).

> Si al subir aparece `Failed to connect ... Timed out waiting for packet
> header`: mantené apretado el botón **BOOT** de la placa mientras empieza la
> carga, y soltalo cuando veas "Connecting...".

---

## 5. Verificar que anda

Abrí el **Monitor Serie** (*Herramientas → Monitor Serie*) y poné la velocidad
en **115200**. Tendrías que ver algo así:

```
=====================================
 Mantech Latam - Sensor de campo
 Firmware 1.0.0
=====================================
MPU6050 detectado en 0x68
DS18B20 detectado (1 sensor/es).
Conectando a WiFi 'MiRed'....
WiFi conectado. IP: 192.168.0.45
---------------------------------------
Temperatura : 24.31 C
Vibración   : 0.0142 g
Inclinación : 1.84 grados
Enviado OK. Respuesta: {"accepted":3,...}
```

El **LED azul** de la placa también te dice qué pasa, sin computadora:

| LED | Significado |
|---|---|
| 1 parpadeo | Envío correcto |
| 2 parpadeos | El servidor rechazó el envío — revisá la clave del dispositivo |
| 3 parpadeos | No hay WiFi — revisá nombre y contraseña de la red |

Entrá a **https://app.mantech.lat → Sensores**: el dispositivo aparece *En
línea* y los valores se actualizan solos.

---

## 6. Si algo no funciona

| Síntoma | Qué revisar |
|---|---|
| `DS18B20 NO detectado` | La resistencia de 4,7 kΩ entre DATA y 3V3. Que DATA esté en GPIO 4. Que VCC sea 3V3 y no 5V. |
| `MPU6050 NO detectado` | SDA en GPIO 21 y SCL en GPIO 22 (es fácil cruzarlos). Que VCC sea 3V3. |
| Temperatura siempre −127 | El sensor no responde: es el mismo problema que "no detectado". |
| No se conecta al WiFi | Que la red sea de 2,4 GHz. Que la contraseña no tenga errores. Probá con el punto de acceso del celular. |
| `Código HTTP: 403` | La clave del dispositivo no coincide con la del servidor. |
| `Código HTTP: -1` o timeout | La placa llega al WiFi pero no a internet. Probá otra red. |
| Vibración siempre en 0,00 | Normal con la placa quieta sobre la mesa: golpeá suave la superficie y tiene que subir. |

---

## 7. Probar sin el hardware

Si querés ver la pantalla funcionando antes de armar nada, hay un simulador que
manda exactamente lo mismo que mandaría la placa:

```bash
cd firmware/simulador
node simular-sensor.js --key TU_CLAVE_DE_DISPOSITIVO
```

Escenarios disponibles:

```bash
# valores sanos
node simular-sensor.js --key TU_CLAVE --escenario normal

# la temperatura sube de a poco y cruza los umbrales: sirve para ver
# el semáforo pasar de verde a amarillo y a rojo
node simular-sensor.js --key TU_CLAVE --escenario calentamiento

# todo en rojo
node simular-sensor.js --key TU_CLAVE --escenario falla
```

Se corta con `Ctrl+C`. No necesita instalar nada: usa Node 18 o superior.

---

## 8. Ajustes que podés hacer sin tocar el código

Desde las variables del servicio `backend` en Railway:

| Variable | Qué hace | Por defecto |
|---|---|---|
| `IOT_TEMP_WARNING` | °C a partir de los cuales la temperatura pasa a amarillo | 60 |
| `IOT_TEMP_CRITICAL` | °C a partir de los cuales pasa a rojo | 80 |
| `IOT_VIB_WARNING` | g de vibración para el amarillo | 0.5 |
| `IOT_VIB_CRITICAL` | g de vibración para el rojo | 1.5 |
| `IOT_TILT_WARNING` | grados de inclinación para el amarillo | 5 |
| `IOT_TILT_CRITICAL` | grados de inclinación para el rojo | 15 |
| `IOT_RETENTION_DAYS` | días de mediciones que se conservan | 3 |
| `IOT_DEVICE_KEY` | clave del dispositivo que crea el sembrado inicial | — |

El **ritmo de envío** se cambia en la base de datos, en la columna
`interval_seconds` de la tabla `iot_devices`: el servidor se lo informa a la
placa en cada respuesta y el firmware se adapta solo, sin reprogramar nada.

---

## Nota sobre seguridad

El firmware se conecta por HTTPS pero **no valida el certificado del servidor**
(`client.setInsecure()`). El tráfico viaja cifrado, pero un atacante en la misma
red podría suplantar al servidor. Es aceptable para el piloto; antes de instalar
esto en la planta de un cliente hay que fijar el certificado raíz en el
firmware.

La clave del dispositivo da permiso para **escribir mediciones**, nada más: no
permite leer datos de la plataforma ni acceder a ninguna otra parte del sistema.
