import React from 'react';
import { View } from 'react-native';
// WIP: use correct svg
// import { DotIcon } from '@/icons/DotIcon';
import { Lang } from '@/types/types';
import { CustomText } from '../ui/CustomText';

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
  const dateLang = locale === 'en' ? 'en-US' : 'es-ES';
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
            {/* <DotIcon
              size={10}
              color='#555'
            /> */}
            <CustomText type='subtitle'>- {timeString}</CustomText>
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
