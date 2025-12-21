import React, { useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { DHMS, diffToDHMS } from '@/utils/diffToDHMS';
import { CustomText } from './CustomText';
import { Lang } from '@/types/types';

export function SimpleCountdown({
  dateString,
  locale,
  texts,
}: {
  dateString: string | Date;
  locale: Lang;
  texts: { completed: { es: string; en: string } };
}) {
  const targetDate = useMemo(
    () => new Date(new Date(dateString).toISOString()),
    [dateString]
  );

  const [state, setState] = useState<DHMS>(() =>
    diffToDHMS(targetDate.getTime() - Date.now())
  );

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const ms = targetDate.getTime() - Date.now();
      setState(diffToDHMS(ms));
    };

    const id = setInterval(tick, 1000);
    tick();

    const onChange = (s: AppStateStatus) => {
      if (s === 'active') tick();
    };
    const sub = AppState.addEventListener('change', onChange);

    return () => {
      mounted = false;
      clearInterval(id);
      sub.remove();
    };
  }, [targetDate]);

  if (state.completed) {
    return (
      <CustomText
        type='h4'
        className='font-bold text-black'
      >
        {texts.completed[locale]}
      </CustomText>
    );
  }

  const { days, hours, minutes, seconds } = state;

  return (
    <CustomText
      type='h4'
      className='font-bold text-cinnabar'
    >
      {days}d {hours}h {minutes}m {seconds}s
    </CustomText>
  );
}
