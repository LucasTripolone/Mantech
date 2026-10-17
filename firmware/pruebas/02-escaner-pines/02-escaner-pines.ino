// ============================================================================
//  Mantech Latam - Prueba 2: escaner de pines 1-Wire
//
//  Recorre TODOS los pines utilizables del ESP32 buscando el DS18B20.
//  Sirve para distinguir dos situaciones que desde afuera se ven igual:
//
//    a) El sensor esta bien conectado pero el cable de datos quedo en
//       otro pin  -> lo encuentra y dice en cual.
//    b) El sensor no responde en ningun pin -> el problema es la
//       alimentacion, la resistencia o un contacto flojo.
//
//  No hace falta cambiar nada: se graba y reporta solo.
// ============================================================================

#include <OneWire.h>

// Pines que pueden usarse como entrada/salida digital.
// Se excluyen 6..11 (conectados a la memoria flash interna) y 34..39
// (son solo de entrada, no pueden manejar el bus 1-Wire).
const int PINES[] = { 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33 };
const int CANTIDAD = sizeof(PINES) / sizeof(PINES[0]);

int vuelta = 0;

/** Busca dispositivos 1-Wire en un pin. Devuelve cuantos encontro. */
int buscarEn(int pin, uint8_t *direccion) {
  OneWire bus(pin);
  uint8_t addr[8];
  int encontrados = 0;

  bus.reset_search();
  delay(20);

  while (bus.search(addr)) {
    // Una direccion valida tiene CRC correcto y no es toda ceros ni toda unos:
    // un pin al aire suele devolver basura que pasa la busqueda pero no el CRC.
    if (OneWire::crc8(addr, 7) == addr[7] && addr[0] != 0x00 && addr[0] != 0xFF) {
      encontrados++;
      if (direccion) memcpy(direccion, addr, 8);
    }
  }
  return encontrados;
}

void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println();
  Serial.println("==========================================");
  Serial.println(" Mantech - Escaner de pines 1-Wire");
  Serial.println("==========================================");
  Serial.print(" Se van a probar ");
  Serial.print(CANTIDAD);
  Serial.println(" pines.");
}

void loop() {
  vuelta++;
  Serial.println();
  Serial.print("----- Vuelta ");
  Serial.print(vuelta);
  Serial.println(" -----");

  int totalEncontrados = 0;

  for (int i = 0; i < CANTIDAD; i++) {
    uint8_t addr[8];
    int n = buscarEn(PINES[i], addr);

    if (n > 0) {
      totalEncontrados += n;
      Serial.print("  >>> GPIO ");
      Serial.print(PINES[i]);
      Serial.print("  ENCONTRADO  ");
      for (uint8_t j = 0; j < 8; j++) {
        if (addr[j] < 16) Serial.print("0");
        Serial.print(addr[j], HEX);
        if (j < 7) Serial.print(":");
      }
      if (addr[0] == 0x28 || addr[0] == 0x10) {
        Serial.println("   <-- es un DS18B20");
      } else {
        Serial.println("   <-- dispositivo 1-Wire");
      }
    }
  }

  if (totalEncontrados == 0) {
    Serial.println("  Ningun pin respondio.");
    Serial.println();
    Serial.println("  Como no aparece en NINGUN pin, el problema no es");
    Serial.println("  en que pin esta el cable de datos. Revisa:");
    Serial.println("   - Que el sensor tenga alimentacion: rojo al riel +");
    Serial.println("     y negro al riel -, con los rieles alimentados.");
    Serial.println("   - La resistencia de 4,7 kOhm entre el dato y el +.");
    Serial.println("   - Que los tres cables del sensor hagan buen contacto");
    Serial.println("     en la protoboard y con el conector del sensor.");
    Serial.println("   - Que el amarillo y la resistencia esten en la MISMA");
    Serial.println("     columna y del mismo lado del canal central.");
  } else {
    Serial.println();
    Serial.print("  TOTAL: ");
    Serial.print(totalEncontrados);
    Serial.println(" dispositivo(s). Si el GPIO de arriba no es el 4,");
    Serial.println("  el cable de datos quedo en la columna equivocada.");
  }

  delay(3000);
}
