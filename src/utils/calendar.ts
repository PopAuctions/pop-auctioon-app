import { MONTHS } from '@/constants';
import { type MonthEntry } from '@/types/types';

/**
 * Genera un mapa de los próximos meses desde hoy para uso en calendarios
 * Incluye una entrada especial '0' para 'Hoy'
 *
 * @returns Map con los meses disponibles donde la key es el número del mes como string
 */
export function getCalendarMonths(): Map<string, MonthEntry> {
  const today = new Date();
  // we add 1 because getMonth() returns a 0-based index
  const currentMonth = today.getMonth() + 1;

  // Generate an array of the next 2 months, wrapping around if necessary
  const threeNextMonthsFromToday = Array.from({ length: 2 }, (_, i) => {
    const month = currentMonth + i;
    return month > 12 ? month - 12 : month;
  });

  // Use a Map to preserve the insertion order
  const months = new Map<string, MonthEntry>();

  // Insert '0' for 'Today'
  months.set('0', { es: 'Hoy', en: 'Today', value: 0 });

  // Iterate through the months in the order they should appear
  threeNextMonthsFromToday.forEach((month) => {
    const monthKey = month.toString();

    months.set(monthKey, {
      ...MONTHS[monthKey as keyof typeof MONTHS],
      value: month,
    });
  });

  return months;
}

/**
 * Obtiene el nombre del mes actual en el idioma especificado
 *
 * @param locale - 'es' | 'en'
 * @returns Nombre del mes actual
 */
export function getCurrentMonthName(locale: 'es' | 'en' = 'es'): string {
  const today = new Date();
  const currentMonth = (today.getMonth() + 1).toString();

  const monthData = MONTHS[currentMonth as keyof typeof MONTHS];
  return monthData ? monthData[locale] : '';
}

/**
 * Obtiene el nombre del mes traducido para un número de mes específico
 *
 * @param monthNumber - Número del mes (1-12) como string o number
 * @param locale - Idioma para la traducción ('es' | 'en')
 * @returns Nombre del mes traducido
 */
export function getMonthName(
  monthNumber: string | number,
  locale: 'es' | 'en' = 'es'
): string {
  const monthKey = monthNumber.toString() as keyof typeof MONTHS;
  return MONTHS[monthKey] ? MONTHS[monthKey][locale] : '';
}

/**
 * Verifica si una fecha está en el mes actual
 *
 * @param date - Fecha a verificar
 * @returns true si la fecha está en el mes actual
 */
export function isCurrentMonth(date: Date): boolean {
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Formatea una fecha para mostrar en calendario
 *
 * @param date - Fecha a formatear
 * @param locale - Locale para el formato
 * @returns Fecha formateada
 */
export function formatCalendarDate(
  date: Date,
  locale: string = 'es-ES'
): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha para el historial de pagos
 * Ejemplo: "October 8, 2025 at 6:43 AM"
 *
 * @param dateString - Fecha en formato string ISO
 * @param lang - Idioma ('es' | 'en')
 * @returns Fecha formateada con hora
 */
export function formatPaymentDate(
  dateString: string,
  lang: 'es' | 'en' = 'es'
): string {
  const dateISO = new Date(dateString).toISOString();
  const formattedDate = new Date(dateISO);
  const dateLang = lang === 'en' ? 'en-US' : 'es-ES';

  return formattedDate.toLocaleDateString(dateLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
