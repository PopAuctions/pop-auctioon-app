import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, Linking, ViewStyle } from 'react-native';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { requiresAuth as checkRequiresAuth } from '@/components/navigation/routeConfig';

/**
 * CustomLink - Componente inteligente de navegación
 *
 * Automáticamente determina si una ruta requiere autenticación consultando
 * la configuración centralizada en routeConfig.ts. No necesitas pasar props
 * de autenticación - todo se maneja automáticamente.
 *
 * Ejemplos:
 * - '/home/api-testing' -> Ruta pública (no requiere auth)
 * - '/(tabs)/auctions' -> Requiere autenticación (configurado en routeConfig)
 * - '/(tabs)/my-auctions' -> Requiere autenticación + rol AUCTIONEER
 */
interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  mode?: 'empty' | 'primary' | 'secondary' | 'plainText';
  size?: 'small' | 'large';
  className?: string;
  style?: ViewStyle;
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
      style,
      outsideRedirect = false,
    },
    ref
  ) => {
    const { navigateWithAuth } = useAuthNavigation();
    const modeStyle = `${LINK_MODE_STYLES[mode]} ${LINK_SIZE_STYLES[mode][size]}`;

    const hoverEffects = hoverEffect
      ? 'active:scale-105 transition-all duration-300 ease-out'
      : '';

    // Extraer nombre de la ruta para verificar si requiere autenticación
    const extractRouteName = (path: string): string => {
      // Casos de ejemplo:
      // '/(tabs)/my-auctions/create' -> 'my-auctions'
      // '/(tabs)/auctions/calendar' -> 'auctions'
      // '/home/api-testing' -> 'home'
      // '/(tabs)/account' -> 'account'

      // Remover parámetros de ruta y grupos de Expo Router
      const cleanPath = path.split('?')[0]; // Remover query params
      const routeParts = cleanPath
        .split('/')
        .filter((part) => part && !part.includes('(') && !part.includes(')'));

      // Tomar la primera parte significativa de la ruta
      return routeParts[0] || '';
    };

    const handlePress = async () => {
      if (outsideRedirect) {
        // Para enlaces externos
        const canOpen = await Linking.canOpenURL(href);
        if (canOpen) {
          await Linking.openURL(href);
        }
      } else {
        // Para navegación interna - verificar automáticamente si requiere auth
        const routeName = extractRouteName(href);
        const needsAuth = checkRequiresAuth(routeName);

        if (needsAuth) {
          // Usar navigateWithAuth que maneja verificación de autenticación y roles
          navigateWithAuth(href as any);
        } else {
          // Para rutas públicas, también usar navigateWithAuth por consistencia
          // (navigateWithAuth maneja rutas públicas correctamente)
          navigateWithAuth(href as any);
        }
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        className={`${modeStyle} ${hoverEffects} text-center text-base font-normal ${className || ''}`}
        style={style}
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
);

CustomLink.displayName = 'CustomLink';
