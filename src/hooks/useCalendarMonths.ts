import { useMemo } from 'react';

interface MonthEntry {
  es: string;
  en: string;
}

export const useCalendarMonths = () => {
  const months = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-based

    // Meses en español
    const monthsEs = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    // Meses en inglés
    const monthsEn = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Crear entradas para este mes y el siguiente
    const thisMonth: MonthEntry = {
      es: monthsEs[currentMonth],
      en: monthsEn[currentMonth],
    };

    const nextMonth: MonthEntry = {
      es: monthsEs[(currentMonth + 1) % 12],
      en: monthsEn[(currentMonth + 1) % 12],
    };

    return {
      thisMonth,
      nextMonth,
    };
  }, []);

  return months;
};
