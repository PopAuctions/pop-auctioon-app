import React from 'react';
import { View } from 'react-native';
import { Lang } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { LOCALE_CONFIG } from '@/i18n/locales';

interface AuctionDisplayDateTimeProps {
  startDate: string;
  locale: Lang;
  singleLine?: boolean;
  displayTime?: boolean;
}

export const AuctionDisplayDateTime = ({
  startDate,
  locale,
  singleLine = false,
  displayTime = true,
}: AuctionDisplayDateTimeProps) => {
  const dateLang = LOCALE_CONFIG[locale].intlLocale;
  const formattedDate = new Date(startDate);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateString = formattedDate.toLocaleDateString(dateLang, {
    timeZone: userTimeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeString = formattedDate.toLocaleTimeString(dateLang, {
    timeZone: userTimeZone,
    hour: '2-digit',
    minute: '2-digit',
  });

  if (singleLine) {
    return (
      <View className='flex-row items-center gap-2'>
        <CustomText type='subtitle'>{dateString}</CustomText>
        {displayTime && (
          <>
            <FontAwesomeIcon
              variant='bold'
              name='circle'
              size={5}
              color='#000'
            />
            <CustomText type='subtitle'>{timeString}</CustomText>
          </>
        )}
      </View>
    );
  }

  return (
    <View>
      <CustomText type='subtitle'>{dateString}</CustomText>
      {displayTime && <CustomText type='subtitle'>{timeString}</CustomText>}
    </View>
  );
};
