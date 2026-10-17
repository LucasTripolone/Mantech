// ============================================================================
//  Mantech Latam - Prueba 1: DS18B20 solo
//
//  Diagnóstico del sensor de temperatura, SIN WiFi y SIN servidor. Sirve para
//  separar un problema de cableado de uno de red: si esta prueba anda, el
//  hardware está bien y lo que falte es configuración.
//
//  Cableado esperado:
//    DS18B20 rojo    (VCC)  -> 3V3 del ESP32  (NO a VIN: VIN son 5 V)
//    DS18B20 negro   (GND)  -> GND del ESP32
//    DS18B20 amarillo(DATA) -> GPIO 4
//    Resistencia 4,7 kOhm entre DATA y 3V3
//
//  Librerías necesarias (Gestor de Librerías del IDE):
//    - OneWire            (Paul Stoffregen)
//    - DallasTemperature  (Miles Burton)
//
//  Abrí el Monitor Serie a 115200 baudios.
// ============================================================================

#include <OneWire.h>
#include <DallasTemperature.h>

#define PIN_DS18B20 4

OneWire oneWire(PIN_DS18B20);
DallasTemperature dallas(&oneWire);

DeviceAddress sensorAddress;
bool sensorFound = false;
int ciclo = 0;

void imprimirDireccion(DeviceAddress addr) {
  for (uint8_t i = 0; i < 8; i++) {
    if (addr[i] < 16) Serial.print("0");
    Serial.print(addr[i], HEX);
    if (i < 7) Serial.print(":");
  }
}

/**
 * Recorre el bus 1-Wire a bajo nivel.
 *
 * Es más informativo que preguntarle a la librería cuántos sensores hay: acá se
 * ve si el bus responde pero con datos corruptos, que es el síntoma típico de
 * una resistencia pull-up ausente o de un valor equivocado.
 */
void escanearBus() {
  Serial.println();
  Serial.println("Buscando sensores en el bus 1-Wire (GPIO 4)...");

  uint8_t addr[8];
  int encontrados = 0;
  oneWire.reset_search();

  while (oneWire.search(addr)) {
    encontrados++;
    Serial.print("  Dispositivo ");
    Serial.print(encontrados);
    Serial.print(": ");
    for (uint8_t i = 0; i < 8; i++) {
      if (addr[i] < 16) Serial.print("0");
      Serial.print(addr[i], HEX);
      if (i < 7) Serial.print(":");
    }

    if (OneWire::crc8(addr, 7) != addr[7]) {
      Serial.println("   <-- CRC INVALIDO");
      Serial.println("       La direccion llego corrupta. Casi siempre es la");
      Serial.println("       resistencia pull-up: falta, esta mal conectada o");
      Serial.println("       el valor no es 4,7 kOhm.");
    } else if (addr[0] == 0x28) {
      Serial.println("   <-- DS18B20 OK");
      memcpy(sensorAddress, addr, 8);
      sensorFound = true;
    } else if (addr[0] == 0x10) {
      Serial.println("   <-- DS18S20 (variante antigua) OK");
      memcpy(sensorAddress, addr, 8);
      sensorFound = true;
    } else {
      Serial.println("   <-- Dispositivo 1-Wire desconocido");
    }
  }
  oneWire.reset_search();

  if (encontrados == 0) {
    Serial.println("  NINGUNO.");
    Serial.println();
    Serial.println("  Revisa, en este orden:");
    Serial.println("   1. La resistencia de 4,7 kOhm entre DATA y 3V3.");
    Serial.println("      Sin ella el bus queda flotando y no responde nadie.");
    Serial.println("   2. Que el cable de datos este en GPIO 4 (D4).");
    Serial.println("   3. Que VCC del sensor este en 3V3 y GND en GND.");
    Serial.println("   4. Que los tres cables esten bien pinchados en la");
    Serial.println("      protoboard (empujalos hasta el fondo).");
    Serial.println("   5. Que la fila de la protoboard sea la correcta: dentro");
    Serial.println("      de una fila los 5 agujeros estan unidos, pero el canal");
    Serial.println("      del medio separa las dos mitades.");
  } else {
    Serial.print("  Total encontrados: ");
    Serial.println(encontrados);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("========================================");
  Serial.println(" Mantech - Prueba del sensor DS18B20");
  Serial.println("========================================");
  Serial.print(" Pin de datos: GPIO ");
  Serial.println(PIN_DS18B20);

  dallas.begin();
  escanearBus();

  if (sensorFound) {
    Serial.print("Sensor listo. Direccion: ");
    imprimirDireccion(sensorAddress);
    Serial.println();
    // 11 bits = 0,125 grados de resolucion, y tarda la mitad que 12 bits.
    dallas.setResolution(sensorAddress, 11);
    Serial.print("Alimentacion del sensor: ");
    Serial.println(dallas.isParasitePowerMode() ? "PARASITA (solo 2 cables)" : "NORMAL (3 cables)");
    Serial.println();
    Serial.println("Midiendo cada 2 segundos. Agarra el sensor con la mano");
    Serial.println("para ver subir la temperatura.");
  } else {
    Serial.println("No se puede medir sin sensor. Corregi el cableado y");
    Serial.println("apreta el boton EN (reset) de la placa.");
  }
  Serial.println("----------------------------------------");
}

void loop() {
  delay(2000);

  // Mientras no haya sensor, se reintenta la busqueda: asi alcanza con
  // corregir el cableado, sin reiniciar la placa.
  if (!sensorFound) {
    ciclo++;
    Serial.print("Reintentando busqueda (");
    Serial.print(ciclo);
    Serial.println(")...");
    dallas.begin();
    escanearBus();
    if (sensorFound) {
      dallas.setResolution(sensorAddress, 11);
      Serial.println("Sensor detectado. Empezando a medir.");
    }
    return;
  }

  dallas.requestTemperatures();
  float c = dallas.getTempC(sensorAddress);

  if (c == DEVICE_DISCONNECTED_C || c <= -100.0f) {
    Serial.println("Lectura: SIN RESPUESTA (-127)");
    Serial.println("  El sensor dejo de contestar. Revisa que los cables no");
    Serial.println("  se hayan movido y que la resistencia siga en su lugar.");
    sensorFound = false;  // vuelve al modo busqueda
    return;
  }

  // 85,00 exacto es el valor que trae el registro del DS18B20 de fabrica: si
  // aparece, el sensor se reinicio y no llego a completar la medicion. Casi
  // siempre es alimentacion insuficiente o un pull-up mal puesto.
  if (c > 84.9f && c < 85.1f) {
    Serial.println("Lectura: 85.00 C  <-- VALOR SOSPECHOSO");
    Serial.println("  Es el valor por defecto del sensor, no una medicion real.");
    Serial.println("  Suele indicar que VCC no esta firme o que falta el pull-up.");
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(c, 2);
  Serial.print(" C   (");
  Serial.print(c * 9.0 / 5.0 + 32.0, 1);
  Serial.println(" F)");
}
