import { type MonthEntry } from '@/types/types';

/**
 * Constantes de meses en español e inglés
 * Las keys son números del 0-12 como strings (0 = 'Hoy')
 */
export const MONTHS: Record<string, MonthEntry> = {
  '0': { es: 'Hoy', en: 'Today', value: 0 },
  '1': { es: 'Enero', en: 'January', value: 1 },
  '2': { es: 'Febrero', en: 'February', value: 2 },
  '3': { es: 'Marzo', en: 'March', value: 3 },
  '4': { es: 'Abril', en: 'April', value: 4 },
  '5': { es: 'Mayo', en: 'May', value: 5 },
  '6': { es: 'Junio', en: 'June', value: 6 },
  '7': { es: 'Julio', en: 'July', value: 7 },
  '8': { es: 'Agosto', en: 'August', value: 8 },
  '9': { es: 'Septiembre', en: 'September', value: 9 },
  '10': { es: 'Octubre', en: 'October', value: 10 },
  '11': { es: 'Noviembre', en: 'November', value: 11 },
  '12': { es: 'Diciembre', en: 'December', value: 12 },
} as const;
