import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';

type SmartBackProps = {
  /**
   * Where to go when this screen was opened via cross-tab navigation / deeplink.
   * Example: '/(tabs)/account'
   */
  fallbackHref: Href;

  /**
   * If true, always go to fallbackHref (force reset behavior).
   */
  alwaysFallback?: boolean;

  /**
   * Query param used to mark "cross-tab entry".
   * Default: 'fromTab'
   */
  markerParam?: string;

  /**
   * Expected marker value. Default: 'true'
   * Example: you can set 'account' if you prefer.
   */
  markerValue?: string;

  label: string;

  className?: string;

  hitSlop?: PressableProps['hitSlop'];
};

export const SmartBack = ({
  fallbackHref,
  alwaysFallback = false,
  markerParam = 'fromTab',
  markerValue = 'true',
  label,
  className,
  hitSlop = 10,
}: SmartBackProps) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const marker = params[markerParam];
  const markerStr = Array.isArray(marker) ? marker[0] : marker;
  const shouldFallback = alwaysFallback || markerStr === markerValue;

  return (
    <Pressable
      onPress={() => {
        if (shouldFallback) {
          router.replace(fallbackHref);
        } else {
          router.back();
        }
      }}
      className={cn(
        'flex flex-row items-center justify-center gap-2 rounded-full px-2',
        className ?? ''
      )}
      hitSlop={hitSlop}
    >
      <FontAwesomeIcon
        name='chevron-left'
        size={20}
        color='#d75639'
      />
      <CustomText type='bodysmall'>{label}</CustomText>
    </Pressable>
  );
};
