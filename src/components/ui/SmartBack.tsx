import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { router, type Href } from 'expo-router';
import { useNavigationState } from '@react-navigation/native';
import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';

type SmartBackProps = {
  fallbackHref: Href;
  alwaysFallback?: boolean;
  markerParam?: string;
  markerValue?: string;
  label: string;
  className?: string;
  hitSlop?: PressableProps['hitSlop'];
};

type RouteParamsValue = string | string[] | undefined;

export const SmartBack = ({
  fallbackHref,
  alwaysFallback = false,
  markerParam = 'fromTab',
  markerValue = 'true',
  label,
  className,
  hitSlop = 10,
}: SmartBackProps) => {
  const currentRoute = useNavigationState((state) => state.routes[state.index]);

  const params = (currentRoute?.params ?? {}) as Record<
    string,
    RouteParamsValue
  >;

  const marker = params[markerParam];
  const markerStr = Array.isArray(marker) ? marker[0] : marker;
  const shouldFallback = alwaysFallback || markerStr === markerValue;

  const handlePress = () => {
    if (shouldFallback) {
      router.replace(fallbackHref);
      return;
    }

    router.back();
  };

  return (
    <Pressable
      onPress={handlePress}
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
