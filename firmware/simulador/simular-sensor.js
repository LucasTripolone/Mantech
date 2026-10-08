#!/usr/bin/env node
/**
 * Simulador del sensor de campo de Mantech.
 *
 * Manda al servidor las mismas lecturas que mandaría el ESP32, para poder
 * probar la pantalla en vivo sin tener el hardware armado.
 *
 * Uso:
 *   node simular-sensor.js --key <CLAVE_DEL_DISPOSITIVO>
 *
 * Opciones:
 *   --key       Clave del dispositivo (obligatoria)
 *   --url       Servidor (por defecto https://api.mantech.lat)
 *   --interval  Segundos entre envíos (por defecto 10)
 *   --escenario normal | calentamiento | falla   (por defecto normal)
 *
 * No necesita instalar nada: usa sólo lo que trae Node 18 o superior.
 */

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const DEVICE_KEY = arg('key', process.env.MANTECH_DEVICE_KEY || '');
const API_URL = arg('url', process.env.MANTECH_API_URL || 'https://api.mantech.lat').replace(/\/$/, '');
let intervalSeconds = Number(arg('interval', '10'));
const escenario = arg('escenario', 'normal');

if (!DEVICE_KEY) {
  console.error('Falta la clave del dispositivo.\n');
  console.error('  node simular-sensor.js --key TU_CLAVE\n');
  process.exit(1);
}

/**
 * Perfiles de comportamiento.
 *
 * `calentamiento` sube la temperatura de a poco hasta cruzar los umbrales, que
 * es la forma de ver el semáforo cambiar de verde a amarillo y a rojo sin
 * esperar a que una máquina real falle.
 */
const ESCENARIOS = {
  normal: { tempBase: 38, tempDeriva: 0, vibBase: 0.08, vibDeriva: 0, tilt: 1.5 },
  calentamiento: { tempBase: 45, tempDeriva: 1.2, vibBase: 0.12, vibDeriva: 0.02, tilt: 2.0 },
  falla: { tempBase: 86, tempDeriva: 0, vibBase: 1.9, vibDeriva: 0, tilt: 17 },
};

const perfil = ESCENARIOS[escenario];
if (!perfil) {
  console.error(`Escenario desconocido: ${escenario}`);
  console.error(`Opciones: ${Object.keys(ESCENARIOS).join(', ')}`);
  process.exit(1);
}

const ruido = (amplitud) => (Math.random() - 0.5) * 2 * amplitud;

let ciclo = 0;
let enviados = 0;
let fallidos = 0;

async function enviar() {
  const temperatura = perfil.tempBase + perfil.tempDeriva * ciclo + ruido(0.6);
  const vibracion = Math.max(0, perfil.vibBase + perfil.vibDeriva * ciclo + ruido(0.03));
  const inclinacion = Math.max(0, perfil.tilt + ruido(0.4));
  ciclo++;

  const body = {
    firmwareVersion: '1.0.0-sim',
    uptimeSeconds: ciclo * intervalSeconds,
    readings: [
      { metric: 'TEMPERATURA', value: Number(temperatura.toFixed(2)), unit: 'C' },
      { metric: 'VIBRACION', value: Number(vibracion.toFixed(4)), unit: 'g' },
      { metric: 'INCLINACION', value: Number(inclinacion.toFixed(2)), unit: 'deg' },
    ],
  };

  const hora = new Date().toLocaleTimeString('es-AR');

  try {
    const res = await fetch(`${API_URL}/api/iot/ingest/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Key': DEVICE_KEY },
      body: JSON.stringify(body),
    });

    const texto = await res.text();

    if (res.status === 200) {
      enviados++;
      const data = JSON.parse(texto);
      console.log(
        `${hora}  ✓  ${temperatura.toFixed(1)} °C  |  ` +
        `${vibracion.toFixed(3)} g  |  ${inclinacion.toFixed(1)}°  ` +
        `(aceptadas: ${data.accepted})`,
      );
      // El servidor manda el ritmo con el que quiere recibir datos, igual que
      // al firmware real.
      if (data.intervalSeconds && data.intervalSeconds !== intervalSeconds) {
        intervalSeconds = data.intervalSeconds;
        console.log(`        el servidor pidió reportar cada ${intervalSeconds} s`);
      }
    } else {
      fallidos++;
      console.error(`${hora}  ✗  HTTP ${res.status}: ${texto}`);
      if (res.status === 401 || res.status === 403) {
        console.error('        La clave del dispositivo no es válida.');
      }
    }
  } catch (e) {
    fallidos++;
    console.error(`${hora}  ✗  No se pudo conectar: ${e.message}`);
  }
}

console.log('Simulador de sensor Mantech');
console.log(`  Servidor   : ${API_URL}`);
console.log(`  Escenario  : ${escenario}`);
console.log(`  Intervalo  : ${intervalSeconds} s`);
console.log('  Ctrl+C para cortar.\n');

process.on('SIGINT', () => {
  console.log(`\nCortado. Envíos correctos: ${enviados}, fallidos: ${fallidos}.`);
  process.exit(0);
});

(async function bucle() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await enviar();
    await new Promise((r) => setTimeout(r, intervalSeconds * 1000));
  }
})();
