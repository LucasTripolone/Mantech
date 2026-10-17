// ============================================================================
//  Mantech Latam - Prueba 4: diagnostico del bus 1-Wire
//
//  Mide la tension del propio pin de datos (GPIO 4) y ademas intenta el
//  "reset" del protocolo 1-Wire, que es el saludo con el que el sensor avisa
//  que esta presente.
//
//  No hace falta conectar ningun cable extra: mide el mismo pin donde ya
//  esta el bus.
//
//  COMO SE LEE EL RESULTADO
//
//   Tension ~3,3 V  +  presencia SI
//        -> todo bien, el sensor contesta.
//
//   Tension ~3,3 V  +  presencia NO
//        -> la resistencia funciona, pero el sensor no responde.
//           El problema es el sensor o el contacto de sus cables.
//
//   Tension ~0 V
//        -> algo esta llevando el bus a masa: el sensor mal conectado
//           (cables cruzados) o danado.
//
//   Tension intermedia o que baila
//        -> la resistencia no hace buen contacto; el bus queda al aire.
// ============================================================================

#include <OneWire.h>

#define PIN_DATOS 4

OneWire bus(PIN_DATOS);
int vuelta = 0;

int medirBusMilivolts() {
  // Soltamos el pin para que lo gobierne solo la resistencia de pull-up.
  pinMode(PIN_DATOS, INPUT);
  delay(5);
  long suma = 0;
  for (int i = 0; i < 24; i++) {
    suma += analogReadMilliVolts(PIN_DATOS);
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
  Serial.println(" Mide el pin de datos (GPIO 4) y busca al sensor.");
  Serial.println("------------------------------------------");
}

void loop() {
  vuelta++;

  int mv = medirBusMilivolts();

  // El reset del protocolo: si hay un sensor escuchando, contesta tirando
  // la linea a cero un instante. reset() devuelve 1 cuando detecta esa respuesta.
  bool presencia = bus.reset();

  Serial.println();
  Serial.print("[");
  Serial.print(vuelta);
  Serial.print("]  Tension del bus: ");
  Serial.print(mv);
  Serial.print(" mV    Presencia del sensor: ");
  Serial.println(presencia ? "SI" : "NO");

  Serial.print("     Diagnostico: ");
  if (mv > 2800 && presencia) {
    Serial.println("TODO BIEN. El sensor esta contestando.");
  } else if (mv > 2800 && !presencia) {
    Serial.println("La resistencia funciona (bus en alto), pero el sensor no contesta.");
    Serial.println("     -> Revisa los cables del sensor: rojo al riel +, negro al riel -,");
    Serial.println("        amarillo a la columna del bus. Fijate que los conectores");
    Serial.println("        hagan buen contacto; proba con otro cable si tenes.");
  } else if (mv < 500) {
    Serial.println("El bus esta a MASA. Algo lo esta llevando a cero.");
    Serial.println("     -> Lo mas probable: los cables del sensor cruzados (el amarillo");
    Serial.println("        donde va el negro), o el sensor danado. Proba desconectando");
    Serial.println("        SOLO el sensor: si el bus sube a 3,3 V, el problema es el sensor.");
  } else {
    Serial.println("Tension intermedia: el bus queda al aire.");
    Serial.println("     -> La resistencia no esta haciendo contacto, o no va al riel +.");
  }

  delay(2500);
}
