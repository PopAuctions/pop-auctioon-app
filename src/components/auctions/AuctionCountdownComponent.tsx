import { useEffect, useMemo, useState } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { CustomText } from '../ui/CustomText';
import { CustomLink } from '../ui/CustomLink';
import { AuctionMode, AuctionModeEnum, Lang } from '@/types/types';
import { Translations } from '@/i18n';
import { diffToDHMS, DHMS } from '@/utils/diffToDHMS';

const TEXTS: Record<Lang, { left: string; enterBefore: string }> = {
  es: {
    left: 'Queda:',
    enterBefore: 'Empieza a prepararte',
  },
  en: { left: 'Left:', enterBefore: 'Get ready for the auction' },
};

export function AuctionCountdownComponent({
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

  const [state, setState] = useState<DHMS>(() =>
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
            className='mt-1 w-full'
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
            className='w-full'
            mode='primary'
            href={`/auction/${id}/live-auto`}
          >
            {texts.enterBefore}
          </CustomLink>
        )}
    </View>
  );
}
