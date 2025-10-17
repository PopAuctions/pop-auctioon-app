import { useEffect, useMemo, useState } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { CustomText } from './CustomText';
import { CustomLink } from './CustomLink';
import { AuctionMode, AuctionModeEnum, Lang } from '@/types/types';
import { Translations } from '@/i18n';

const TEXTS: Record<Lang, { left: string; enterBefore: string }> = {
  es: {
    left: 'Queda:',
    leftAlt: 'Queda:',
    enterBefore: 'Empieza a prepararte',
  } as any,
  en: { left: 'Left:', enterBefore: 'Get ready for the auction' } as any,
};

type RendererState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

function diffToDHMS(ms: number): RendererState {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, completed: false };
}

export function CountdownComponent({
  dateString,
  id,
  locale,
  auctionLang,
  auctionMode,
  minutesBefore = 0,
  auctionView = true,
}: {
  dateString: string;
  id: string | number;
  locale: Lang;
  auctionLang: Translations['es']['screens']['auction'];
  auctionMode: AuctionModeEnum;
  minutesBefore?: number;
  auctionView?: boolean;
}) {
  // Normalize to ISO to avoid iOS Date parsing quirks
  const targetDate = useMemo(
    () => new Date(new Date(dateString).toISOString()),
    [dateString]
  );

  const [state, setState] = useState<RendererState>(() =>
    diffToDHMS(targetDate.getTime() - Date.now())
  );

  // Tick every second; recompute from absolute time to avoid drift.
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const ms = targetDate.getTime() - Date.now();
      setState(diffToDHMS(ms));
    };
    const interval = setInterval(tick, 1000);
    // fire once immediately so it doesn't wait 1s to show
    tick();

    // Re-sync after app resumes from background (Android/iOS throttle timers)
    const handleAppState = (s: AppStateStatus) => {
      if (s === 'active') tick();
    };
    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      mounted = false;
      clearInterval(interval);
      sub.remove();
    };
  }, [targetDate]);

  const texts = TEXTS[locale] ?? TEXTS.es;

  if (state.completed) {
    return (
      <View className='items-center'>
        <CustomText
          type='h3'
          className='text-center text-cinnabar'
        >
          {auctionLang.waiting1}
        </CustomText>

        {auctionMode === AuctionMode.AUTOMATIC ? (
          <CustomLink
            className='mt-2 w-full lg:w-fit'
            mode='primary'
            href={`/auction/${id}/live-auto`}
          >
            {texts.enterBefore}
          </CustomLink>
        ) : (
          <CustomText
            type='h4'
            className='mt-1 text-center text-cinnabar'
          >
            {auctionLang.waiting2}
          </CustomText>
        )}
      </View>
    );
  }

  // Ongoing countdown
  const { days, hours, minutes, seconds } = state;

  return (
    <View className={auctionView ? 'items-center gap-2' : ''}>
      <CustomText
        type='h4'
        className='text-center text-cinnabar'
      >
        {texts.left} {/* No SSR in RN, so no suppressHydrationWarning needed */}
        {days}d {hours}h {minutes}m {seconds}s
      </CustomText>

      {auctionMode === AuctionMode.AUTOMATIC &&
        hours <= 0 &&
        minutes <= minutesBefore && (
          <CustomLink
            className='w-full lg:w-fit'
            mode='primary'
            href={`/auction/${id}/live-auto`}
          >
            {texts.enterBefore}
          </CustomLink>
        )}
    </View>
  );
}
