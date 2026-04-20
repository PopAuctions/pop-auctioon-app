import React, { forwardRef } from 'react';
import { Text, Linking, ViewStyle, Pressable } from 'react-native';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { cn } from '@/utils/cn';
import { Href, usePathname, useRouter } from 'expo-router';
import {
  getPathnameFromHref,
  isCrossTabNestedNavigation,
  setCrossTabBackTarget,
} from '@/utils/navigation/crossTabNavigation';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  mode?: 'empty' | 'primary' | 'secondary' | 'plainText';
  size?: 'small' | 'large';
  className?: string;
  textClassName?: string;
  isDisabled?: boolean;
  style?: ViewStyle;
  hoverEffect?: boolean;
  outsideRedirect?: boolean;
}

const LINK_MODE_STYLES = {
  primary:
    'rounded-lg flex-row gap-3 items-center justify-center bg-cinnabar active:opacity-80',
  secondary:
    'rounded-lg flex-row gap-3 items-center justify-center bg-white border border-silver active:opacity-80',
  plainText: 'active:opacity-70',
  empty: '',
};

const TEXT_COLOR_BY_MODE: Record<
  NonNullable<CustomLinkProps['mode']>,
  string
> = {
  primary: 'text-white',
  secondary: 'text-cinnabar',
  plainText: 'text-cinnabar',
  empty: '',
};

const LINK_SIZE_STYLES = {
  primary: {
    small: 'px-4 py-2',
    large: 'px-7 py-3',
  },
  secondary: {
    small: 'px-[15px] py-[7px]',
    large: 'px-[27px] py-[11px]',
  },
  plainText: {
    small: '',
    large: '',
  },
  empty: {
    small: '',
    large: '',
  },
};

export const CustomLink = forwardRef<
  React.ElementRef<typeof Pressable>,
  CustomLinkProps & {
    dismissFirst?: boolean;
    dismissFallbackHref?: Href;
    replace?: boolean;
    onPressOverride?: () => void | Promise<void>;
  }
>(
  (
    {
      href,
      children,
      mode = 'empty',
      size = 'large',
      hoverEffect = true,
      className,
      textClassName,
      style,
      outsideRedirect = false,
      isDisabled = false,
      dismissFirst = false,
      dismissFallbackHref = '/(tabs)/auctions',
      replace = false,
      onPressOverride,
    },
    ref
  ) => {
    const router = useRouter();
    const pathname = usePathname();
    const { navigateWithAuth } = useAuthNavigation();

    const modeStyle = `${LINK_MODE_STYLES[mode]} ${LINK_SIZE_STYLES[mode][size]}`;
    const hoverEffects = hoverEffect
      ? 'active:scale-105 transition-all duration-300 ease-out'
      : '';

    const handlePress = async () => {
      if (isDisabled) return;

      if (onPressOverride) {
        await onPressOverride();
        return;
      }

      if (outsideRedirect) {
        const canOpen = await Linking.canOpenURL(href);
        if (canOpen) await Linking.openURL(href);
        return;
      }

      const isCrossTabNested = isCrossTabNestedNavigation(href, pathname);

      if (isCrossTabNested) {
        const destinationPathname = getPathnameFromHref(href);

        setCrossTabBackTarget(destinationPathname, pathname);
      }

      const go = () => {
        navigateWithAuth(href, { replace });
      };

      if (!dismissFirst) {
        go();
        return;
      }

      if (router.canGoBack()) router.back();
      else router.replace(dismissFallbackHref);

      requestAnimationFrame(() => {
        go();
      });
    };

    return (
      <Pressable
        ref={ref}
        className={cn(modeStyle, hoverEffects, className ?? '')}
        style={[style, isDisabled ? { opacity: 0.5 } : null]}
        onPress={handlePress}
        disabled={isDisabled}
      >
        {mode === 'empty' ? (
          children
        ) : (
          <Text
            className={cn(
              'text-center text-lg font-normal',
              TEXT_COLOR_BY_MODE[mode],
              mode === 'plainText' ? 'underline' : '',
              textClassName
            )}
          >
            {children}
          </Text>
        )}
      </Pressable>
    );
  }
);

CustomLink.displayName = 'CustomLink';
