import React, { forwardRef } from 'react';
import { Link, type Href } from 'expo-router';
import { TouchableOpacity, Text, Linking } from 'react-native';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  mode?: 'empty' | 'primary' | 'secondary' | 'plainText';
  size?: 'small' | 'large';
  className?: string;
  hoverEffect?: boolean;
  outsideRedirect?: boolean;
}

const LINK_MODE_STYLES = {
  primary:
    'text-white rounded-lg flex-row gap-3 items-center justify-center bg-cinnabar active:opacity-80',
  secondary:
    'text-cinnabar rounded-lg flex-row gap-3 items-center justify-center bg-white border border-silver active:opacity-80',
  plainText: 'text-cinnabar active:opacity-70',
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
  React.ElementRef<typeof TouchableOpacity>,
  CustomLinkProps
>(
  (
    {
      href,
      children,
      mode = 'empty',
      size = 'large',
      hoverEffect = true,
      className,
      outsideRedirect = false,
    },
    ref
  ) => {
    const modeStyle = `${LINK_MODE_STYLES[mode]} ${LINK_SIZE_STYLES[mode][size]}`;

    const hoverEffects = hoverEffect
      ? 'active:scale-105 transition-all duration-300 ease-out'
      : '';

    // Para enlaces externos
    if (outsideRedirect) {
      const handlePress = async () => {
        const canOpen = await Linking.canOpenURL(href);
        if (canOpen) {
          await Linking.openURL(href);
        }
      };

      return (
        <TouchableOpacity
          ref={ref}
          className={`${modeStyle} ${hoverEffects} text-center text-base font-normal ${className || ''}`}
          onPress={handlePress}
        >
          <Text
            className={`text-center text-base font-normal ${mode === 'plainText' ? 'underline' : ''}`}
          >
            {children}
          </Text>
        </TouchableOpacity>
      );
    }

    // Para navegación interna con Expo Router
    return (
      <Link
        href={href as Href}
        className={`${modeStyle} ${hoverEffects} text-center text-base font-normal ${className || ''}`}
      >
        <Text
          className={`text-center text-base font-normal ${mode === 'plainText' ? 'underline' : ''}`}
        >
          {children}
        </Text>
      </Link>
    );
  }
);

CustomLink.displayName = 'CustomLink';
