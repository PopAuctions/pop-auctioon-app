import { useMemo } from 'react';
import { MONTHS } from '@/constants';
import type { MonthEntry } from '@/types/types';

export const useCalendarMonths = () => {
  const months = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-based (0-11)

    // Convertir a 1-based para acceder a MONTHS (1-12)
    const currentMonthKey = (currentMonth + 1).toString();
    const nextMonthIndex = (currentMonth + 1) % 12; // siguiente mes en 0-based
    const nextMonthKey = (nextMonthIndex + 1).toString(); // convertir a 1-based

    const thisMonth: MonthEntry = MONTHS[currentMonthKey];
    const nextMonth: MonthEntry = MONTHS[nextMonthKey];

    return {
      thisMonth,
      nextMonth,
    };
  }, []);

  return months;
};
