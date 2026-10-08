import { useWindowDimensions } from 'react-native';
import { breakpoint } from './tokens';

export type Viewport = 'phone' | 'tablet' | 'desktop';

export interface Responsive {
  /** Ancho actual de la ventana. */
  width: number;
  viewport: Viewport;
  isPhone: boolean;
  /** Tablet o más: hay lugar para dos columnas. */
  isWide: boolean;
  /** Escritorio: la navegación va al costado, no abajo. */
  isDesktop: boolean;
  /** Columnas sugeridas para una grilla de tarjetas. */
  columns: number;
  /** Elige un valor según el viewport, cayendo al inmediato inferior. */
  pick: <T>(options: { phone: T; tablet?: T; desktop?: T }) => T;
}

/**
 * Punto único de decisión responsive.
 *
 * La app se publica en web y se usa en teléfono: sin esto, en un monitor las
 * tarjetas se estiran a ~900 px y la barra inferior de cinco pestañas queda
 * flotando abajo de todo, que es un patrón de teléfono.
 */
export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();

  const viewport: Viewport =
    width >= breakpoint.desktop ? 'desktop' : width >= breakpoint.tablet ? 'tablet' : 'phone';

  const isPhone = viewport === 'phone';
  const isDesktop = viewport === 'desktop';

  function pick<T>(options: { phone: T; tablet?: T; desktop?: T }): T {
    if (viewport === 'desktop') return options.desktop ?? options.tablet ?? options.phone;
    if (viewport === 'tablet') return options.tablet ?? options.phone;
    return options.phone;
  }

  return {
    width,
    viewport,
    isPhone,
    isWide: !isPhone,
    isDesktop,
    columns: pick({ phone: 1, tablet: 2, desktop: 3 }),
    pick,
  };
}
