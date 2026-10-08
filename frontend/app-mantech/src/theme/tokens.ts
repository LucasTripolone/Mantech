/**
 * Tokens de diseño de Mantech.
 *
 * Única fuente de verdad para color, tipografía, espaciado, radios y elevación.
 * Reemplaza los 52 valores de color literales que estaban repartidos en 18
 * archivos (el azul de marca aparecía 105 veces).
 *
 * Regla: ninguna pantalla ni componente escribe un color, un tamaño de fuente o
 * un espaciado literal. Todo sale de acá.
 *
 * Los valores conservan la identidad visual que la app ya tenía —el azul
 * profundo de marca y el semáforo industrial— pero racionalizados en escalas
 * coherentes. Donde había dos valores compitiendo para el mismo rol (dos fondos
 * de pantalla, tres grises de borde) se eligió uno.
 */

// ---------------------------------------------------------------------------
// Paleta base
// ---------------------------------------------------------------------------

/**
 * Azul de marca. El 700 es el color histórico de Mantech (#0B3A6E): barra de
 * navegación, encabezados y acciones primarias.
 */
const blue = {
  50: '#EEF4FB',
  100: '#E6F0FB',
  200: '#C7D9F0',
  300: '#8FB4E4',
  400: '#4C84E6', // CTA claro que ya se usaba en login y botones de QR
  500: '#1D4ED8',
  600: '#14508F',
  700: '#0B3A6E', // marca
  800: '#082C53',
  900: '#051D38',
} as const;

/**
 * Neutros con sesgo frío hacia el azul de marca: sobre un fondo industrial el
 * gris puro se ve sucio al lado del azul.
 */
const slate = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F4F6F9', // fondo de pantalla
  200: '#E9EEF3',
  300: '#E2E8F0', // borde
  400: '#CBD5E1',
  500: '#94A3B8',
  600: '#64748B', // texto secundario
  700: '#475569',
  800: '#27364A',
  900: '#0F172A', // texto principal
} as const;

/** Semáforo industrial: es el vocabulario del rubro, no una decoración. */
const signal = {
  greenBg: '#DCFCE7',
  greenSoft: '#2F9E44',
  green: '#15803D',
  greenInk: '#0E5B29',

  amberBg: '#FEF3C7',
  amberSoft: '#F59E0B',
  amber: '#B45309',
  amberInk: '#7C3D06',

  redBg: '#FEE2E2',
  redSoft: '#DC2626',
  red: '#B91C1C',
  redInk: '#8A1512',
} as const;

// ---------------------------------------------------------------------------
// Roles semánticos
// ---------------------------------------------------------------------------

export const color = {
  // Marca y acciones
  brand: blue[700],
  brandDark: blue[800],
  brandSoft: blue[100],
  brandTint: blue[50],
  accent: blue[400],
  onBrand: slate[0],

  // Superficies
  background: slate[100],
  surface: slate[0],
  surfaceSunken: slate[50],
  surfaceMuted: slate[200],
  overlay: 'rgba(15,23,42,0.55)',

  // Texto
  text: slate[900],
  textSecondary: slate[600],
  textMuted: slate[500],
  textOnBrand: slate[0],
  textDisabled: slate[400],

  // Bordes
  border: slate[300],
  borderStrong: slate[400],
  borderSubtle: slate[200],

  // Estado semántico (independiente de la marca)
  success: signal.green,
  successSoft: signal.greenSoft,
  successBg: signal.greenBg,
  successDark: signal.greenInk,
  warning: signal.amber,
  warningSoft: signal.amberSoft,
  warningBg: signal.amberBg,
  warningDark: signal.amberInk,
  danger: signal.red,
  dangerSoft: signal.redSoft,
  dangerBg: signal.redBg,
  dangerDark: signal.redInk,
  info: blue[500],
  infoBg: blue[100],

  // Foco visible: obligatorio para operar con teclado en la versión web
  focusRing: blue[400],
} as const;

// ---------------------------------------------------------------------------
// Estados del dominio
// ---------------------------------------------------------------------------

/**
 * Par de colores (fondo / tinta) por estado. Se define acá y no en cada pantalla
 * para que una insignia de estado se vea igual en toda la app.
 */
export type StatusTone = { bg: string; ink: string };

/** Estado operativo de una máquina. Es el que se ve en el QR de planta. */
export const machineStatusTone: Record<string, StatusTone> = {
  OPERATIVA: { bg: signal.greenBg, ink: signal.green },
  PREVENTIVO: { bg: signal.amberBg, ink: signal.amber },
  FALLA: { bg: signal.redBg, ink: signal.red },
};

/** Ciclo de vida de una orden de trabajo. */
export const workOrderStatusTone: Record<string, StatusTone> = {
  ABIERTA: { bg: blue[100], ink: blue[700] },
  ASIGNADA: { bg: '#E0E9FF', ink: blue[500] },
  EN_PROCESO: { bg: signal.amberBg, ink: signal.amber },
  PAUSADA: { bg: slate[200], ink: slate[700] },
  CERRADA: { bg: signal.greenBg, ink: signal.green },
  CANCELADA: { bg: signal.redBg, ink: signal.red },
};

/** Criticidad del activo y prioridad de la orden comparten escala visual. */
export const levelTone: Record<string, StatusTone> = {
  ALTA: { bg: signal.redBg, ink: signal.red },
  MEDIA: { bg: signal.amberBg, ink: signal.amber },
  BAJA: { bg: signal.greenBg, ink: signal.green },
};

/** Impacto en producción, con su propia nomenclatura (ALTO/MEDIO/BAJO). */
export const impactTone: Record<string, StatusTone> = {
  ALTO: { bg: signal.redBg, ink: signal.red },
  MEDIO: { bg: signal.amberBg, ink: signal.amber },
  BAJO: { bg: signal.greenBg, ink: signal.green },
};

/**
 * Clasificación de una lectura de sensor contra los umbrales de la planta.
 * `SIN_DATOS` es deliberadamente neutro: un sensor caído no es una alarma de
 * la máquina, es una ausencia de información.
 */
export const sensorStatusTone: Record<string, StatusTone> = {
  NORMAL: { bg: signal.greenBg, ink: signal.green },
  ALERTA: { bg: signal.amberBg, ink: signal.amber },
  CRITICO: { bg: signal.redBg, ink: signal.red },
  SIN_DATOS: { bg: slate[200], ink: slate[600] },
};

/** Tono neutro para un valor desconocido: nunca romper por un dato inesperado. */
export const neutralTone: StatusTone = { bg: slate[200], ink: slate[700] };

export function toneFor(map: Record<string, StatusTone>, value?: string | null): StatusTone {
  if (!value) return neutralTone;
  return map[value.toUpperCase()] ?? neutralTone;
}

// ---------------------------------------------------------------------------
// Espaciado
// ---------------------------------------------------------------------------

/** Rejilla de 4. Reemplaza las dos rejillas incompatibles que convivían. */
export const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// ---------------------------------------------------------------------------
// Tipografía
// ---------------------------------------------------------------------------

/**
 * Escala tipográfica cerrada. Antes había 16 tamaños sin relación entre sí.
 * `lineHeight` va explícito: el default de React Native varía por plataforma y
 * era una fuente de desalineación entre web y dispositivo.
 */
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.8 },
  /** Números grandes de KPI: tabulares para que no bailen al actualizarse. */
  metric: { fontSize: 30, lineHeight: 34, fontWeight: '700' },
} as const;

export type TypographyVariant = keyof typeof typography;

// ---------------------------------------------------------------------------
// Radios y elevación
// ---------------------------------------------------------------------------

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

/**
 * Tres niveles de elevación, no ocho recetas copiadas a mano.
 * `elevation` es para Android; el resto para iOS y web.
 */
export const elevation = {
  none: {},
  low: {
    shadowColor: slate[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  high: {
    shadowColor: slate[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
} as const;

// ---------------------------------------------------------------------------
// Ergonomía de planta
// ---------------------------------------------------------------------------

/**
 * La app se usa con guantes, con una mano y con la pantalla al sol. Estos
 * mínimos no son sugerencias: varios controles actuales miden 18 px y son
 * inoperables en ese contexto.
 */
export const touch = {
  /** Alto mínimo de cualquier control accionable. */
  minTarget: 48,
  /** Alto de la acción primaria de una pantalla. */
  primaryAction: 56,
  /** Área extra de toque para iconos que no pueden crecer visualmente. */
  iconHitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

// ---------------------------------------------------------------------------
// Puntos de quiebre
// ---------------------------------------------------------------------------

/**
 * La app se publica también en la web y hoy no tiene un solo punto de quiebre:
 * en un monitor grande las tarjetas se estiran a ~900 px.
 */
export const breakpoint = {
  /** Por debajo: teléfono. Navegación inferior, una columna. */
  phone: 0,
  /** Tablet y ventana chica de escritorio: dos columnas. */
  tablet: 768,
  /** Escritorio: navegación lateral y contenido con ancho máximo. */
  desktop: 1024,
} as const;

/** Ancho máximo del contenido legible en pantallas grandes. */
export const layout = {
  maxContentWidth: 1120,
  /** Ancho máximo de un bloque de texto corrido. */
  maxProseWidth: 640,
  screenPadding: space.lg,
} as const;

export const tokens = {
  color,
  space,
  typography,
  radius,
  elevation,
  touch,
  breakpoint,
  layout,
} as const;

export default tokens;
