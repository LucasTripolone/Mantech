/**
 * Sistema de diseño de Mantech.
 *
 * Punto único de importación para las pantallas: `import { Screen, Card } from '../src/ui'`.
 */

export { Txt } from './Text';
export { Button } from './Button';
export type { ButtonVariant } from './Button';
export { Card } from './Card';
export {
  StatusBadge,
  MachineStatusPill,
  LevelBadge,
  PriorityDot,
  TypeBadge,
} from './Badge';
export { LoadingState, ErrorState, EmptyState } from './States';
export { Field, ChipSelect } from './Field';
export type { ChipOption } from './Field';
export { SectionTitle, KpiTile, Counter, DetailRow } from './Data';
export { Sheet, useConfirm } from './Sheet';
export { Screen, AppHeader } from './Screen';
export { AppNavigation, useNavPlacement, NAV_ITEMS } from './Navigation';
export { WorkOrderCard } from './WorkOrderCard';
export type { WorkOrderLike } from './WorkOrderCard';
export { Grid } from './Grid';
export { SensorChart } from './SensorChart';
export type { ChartPoint } from './SensorChart';
export * from './format';
