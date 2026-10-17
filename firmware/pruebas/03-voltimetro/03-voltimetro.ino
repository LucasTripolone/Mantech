// ============================================================================
//  Mantech Latam - Prueba 3: voltimetro
//
//  Convierte el ESP32 en un medidor de tension, para comprobar sin multimetro
//  si los rieles de la protoboard tienen alimentacion.
//
//  COMO SE USA
//    Con el USB desenchufado, conecta un cable macho-macho desde el punto que
//    quieras medir hasta una de estas columnas:
//
//      columna 4  (pin D15)  -> PUNTO A
//      columna 5  (pin D2)   -> PUNTO B
//
//    Enchufa y mira el monitor serie. Podes medir los dos a la vez.
//
//  QUE SE ESPERA
//    Riel + bien alimentado .... alrededor de 3300 mV
//    Riel - (masa) ............. cerca de 0 mV
//    Nada conectado ............ valor que baila sin sentido (pin al aire)
//
//  SEGURIDAD: medi solo puntos de 3,3 V o menos. NO conectes VIN (5 V) ni
//  nada de mayor tension a estos pines.
// ============================================================================

#define PIN_A 15   // columna 4  (D15)
#define PIN_B 2    // columna 5  (D2)

const int MUESTRAS = 32;

/** Promedia varias lecturas para que el numero no baile. */
int medirMilivolts(int pin) {
  long suma = 0;
  for (int i = 0; i < MUESTRAS; i++) {
    suma += analogReadMilliVolts(pin);
    delay(2);
  }
  return (int)(suma / MUESTRAS);
}

/** Traduce el valor medido a algo que se entienda. */
String interpretar(int mv) {
  if (mv > 3000) return "3,3 V  -> RIEL ALIMENTADO. Correcto.";
  if (mv > 2000) return "tension intermedia -> hay algo, pero cae. Revisar contacto.";
  if (mv > 700)  return "tension baja -> mal contacto o consumo excesivo.";
  if (mv > 150)  return "casi cero -> pin al aire o punto sin alimentacion.";
  return "0 V -> es MASA, o el punto no tiene alimentacion.";
}

void setup() {
  Serial.begin(115200);
  delay(800);

  // Rango completo de medicion (hasta ~3,3 V)
  analogSetAttenuation(ADC_11db);

  Serial.println();
  Serial.println("==========================================");
  Serial.println(" Mantech - Voltimetro");
  Serial.println("==========================================");
  Serial.println(" PUNTO A = columna 4  (pin D15)");
  Serial.println(" PUNTO B = columna 5  (pin D2)");
  Serial.println();
  Serial.println(" Conecta un cable desde el riel + hasta la columna 4.");
  Serial.println(" Si queres, otro desde el riel - hasta la columna 5.");
  Serial.println("------------------------------------------");
}

void loop() {
  int a = medirMilivolts(PIN_A);
  int b = medirMilivolts(PIN_B);

  Serial.println();
  Serial.print("PUNTO A (col 4): ");
  Serial.print(a);
  Serial.print(" mV   ");
  Serial.println(interpretar(a));

  Serial.print("PUNTO B (col 5): ");
  Serial.print(b);
  Serial.print(" mV   ");
  Serial.println(interpretar(b));

  delay(1500);
}
