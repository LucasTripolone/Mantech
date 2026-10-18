// ============================================================================
//  Mantech Latam - Prueba 4: diagnostico del bus 1-Wire
//
//  Mira el estado del pin de datos e intenta el "reset" del protocolo 1-Wire,
//  que es el saludo con el que el sensor avisa que esta presente.
//
//  Cambia PIN_DATOS por el GPIO donde tengas el bus. No hace falta conectar
//  ningun cable extra.
//
//  NOTA: el ESP32 solo puede medir tension en algunos pines (ADC). En los
//  demas se informa el nivel logico, que para este diagnostico alcanza: lo
//  que importa es si la resistencia logra mantener el bus en alto.
//
//  COMO SE LEE EL RESULTADO
//
//   Bus en ALTO  +  presencia SI  -> todo bien, el sensor contesta.
//   Bus en ALTO  +  presencia NO  -> la resistencia funciona pero el sensor
//                                    no responde: sensor o sus contactos.
//   Bus en BAJO                   -> algo lleva la linea a masa.
// ============================================================================

#include <OneWire.h>

#define PIN_DATOS 5

OneWire bus(PIN_DATOS);
int vuelta = 0;

/** Pines del ESP32 que pueden medir tension. El resto solo lee alto/bajo. */
bool tieneADC(int pin) {
  const int conADC[] = { 0, 2, 4, 12, 13, 14, 15, 25, 26, 27, 32, 33, 34, 35, 36, 39 };
  for (unsigned i = 0; i < sizeof(conADC) / sizeof(conADC[0]); i++) {
    if (conADC[i] == pin) return true;
  }
  return false;
}

int medirMilivolts(int pin) {
  long suma = 0;
  for (int i = 0; i < 24; i++) {
    suma += analogReadMilliVolts(pin);
    delay(2);
  }
  return (int)(suma / 24);
}

void setup() {
  Serial.begin(115200);
  delay(800);
  analogSetAttenuation(ADC_11db);

  Serial.println();
  Serial.println("==========================================");
  Serial.println(" Mantech - Diagnostico del bus 1-Wire");
  Serial.println("==========================================");
  Serial.print(" Pin de datos: GPIO ");
  Serial.println(PIN_DATOS);
  Serial.print(" Medicion de tension: ");
  Serial.println(tieneADC(PIN_DATOS) ? "disponible" : "no disponible en este pin (se usa nivel logico)");
  Serial.println("------------------------------------------");
}

void loop() {
  vuelta++;

  // Soltamos el pin para que lo gobierne solo la resistencia de pull-up.
  pinMode(PIN_DATOS, INPUT);
  delay(5);

  bool alto = digitalRead(PIN_DATOS) == HIGH;
  int mv = tieneADC(PIN_DATOS) ? medirMilivolts(PIN_DATOS) : -1;

  // Si hay un sensor escuchando, contesta tirando la linea a cero un instante.
  bool presencia = bus.reset();

  Serial.println();
  Serial.print("[");
  Serial.print(vuelta);
  Serial.print("]  Bus: ");
  Serial.print(alto ? "ALTO" : "BAJO");
  if (mv >= 0) {
    Serial.print(" (");
    Serial.print(mv);
    Serial.print(" mV)");
  }
  Serial.print("    Presencia del sensor: ");
  Serial.println(presencia ? "SI" : "NO");

  Serial.print("     ");
  if (alto && presencia) {
    Serial.println("TODO BIEN. El sensor esta contestando.");
  } else if (alto && !presencia) {
    Serial.println("La resistencia funciona (bus en alto), pero el sensor no contesta.");
    Serial.println("     -> Revisa los cables del sensor y sus contactos.");
  } else {
    Serial.println("El bus esta en BAJO. La resistencia no lo esta levantando,");
    Serial.println("     -> o algo lo lleva a masa. Revisa la resistencia y su columna.");
  }

  delay(2500);
}
