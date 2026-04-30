import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { router, usePathname, type Href } from 'expo-router';
import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { CustomText } from '@/components/ui/CustomText';
import {
  clearCrossTabBackTarget,
  getCrossTabBackTarget,
  markTabForReset,
} from '@/utils/navigation/crossTabNavigation';

type SmartBackProps = {
  fallbackHref: Href;
  alwaysFallback?: boolean;
  label: string;
  className?: string;
  hitSlop?: PressableProps['hitSlop'];
};

export const SmartBack = ({
  fallbackHref,
  alwaysFallback = false,
  label,
  className,
  hitSlop = 10,
}: SmartBackProps) => {
  const pathname = usePathname();

  const handlePress = () => {
    const crossTabEntry = getCrossTabBackTarget(pathname);

    if (crossTabEntry) {
      clearCrossTabBackTarget(pathname);

      // Mark the current tab to be reset next time the user taps it
      markTabForReset(pathname);

      router.replace(crossTabEntry.originHref as Href);
      return;
    }

    if (alwaysFallback || !router.canGoBack()) {
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
