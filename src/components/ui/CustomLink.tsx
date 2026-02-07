import React, { forwardRef } from 'react';
import { Text, Linking, ViewStyle, Pressable } from 'react-native';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { cn } from '@/utils/cn';
import { Href, useRouter } from 'expo-router';

/**
 * Tab routes (parent routes) - extracted from app/(tabs)/_layout.tsx
 */
const TAB_ROUTES = [
  '/(tabs)/home',
  '/(tabs)/auctions',
  '/(tabs)/online-store',
  '/(tabs)/my-auctions',
  '/(tabs)/my-online-store',
  '/(tabs)/account',
  '/(tabs)/auth',
] as const;

/**
 * Detecta si una ruta es anidada (tiene contenido después de la ruta padre)
 * @example
 * isNestedRoute('/(tabs)/account') // false - es ruta padre
 * isNestedRoute('/(tabs)/account/edit-profile') // true - es anidada
 * isNestedRoute('/(tabs)/auctions/[id]') // true - es anidada
 */
function isNestedRoute(href: string): boolean {
  // Eliminar query params para análisis limpio
  const [cleanPath] = href.split('?');

  // Verificar si la ruta coincide exactamente con alguna ruta padre
  const isParentRoute = TAB_ROUTES.some((tabRoute) => cleanPath === tabRoute);

  if (isParentRoute) return false;

  // Verificar si la ruta empieza con alguna ruta padre y tiene contenido adicional
  const hasNestedContent = TAB_ROUTES.some((tabRoute) => {
    return cleanPath.startsWith(tabRoute + '/');
  });

  return hasNestedContent;
}

/**
 * Agrega el parámetro fromTab=true si la ruta es anidada
 * Maneja correctamente query params existentes y hash fragments
 * @example
 * addFromTabParam('/(tabs)/account') // '/(tabs)/account' - sin cambios
 * addFromTabParam('/(tabs)/account/edit-profile') // '/(tabs)/account/edit-profile?fromTab=true'
 * addFromTabParam('/(tabs)/account/edit-profile?foo=bar') // '/(tabs)/account/edit-profile?foo=bar&fromTab=true'
 * addFromTabParam('/(tabs)/account/settings#section-1') // '/(tabs)/account/settings?fromTab=true#section-1'
 */
function addFromTabParam(href: string): string {
  if (!isNestedRoute(href)) return href;

  // Verificar si ya tiene el parámetro fromTab
  if (href.includes('fromTab=')) return href;

  // Separar hash fragment si existe
  const [pathAndQuery, hash] = href.split('#');

  // Agregar el parámetro apropiado
  const separator = pathAndQuery.includes('?') ? '&' : '?';
  const result = `${pathAndQuery}${separator}fromTab=true`;

  // Re-agregar hash fragment si existía
  return hash ? `${result}#${hash}` : result;
}

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
    dismissFallbackHref?: Href; // if can't go back, where to go to close overlay context
    replace?: boolean; // optional: use replace instead of push
    onPressOverride?: () => void | Promise<void>; // optional escape hatch
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

      // Agregar automáticamente fromTab=true si es ruta anidada
      const finalHref = addFromTabParam(href);

      const go = () => {
        navigateWithAuth(finalHref as any, { replace });
      };

      if (!dismissFirst) {
        go();
        return;
      }

      // dismissFirst === true from here on
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

// Exportar funciones helper para testing
export { isNestedRoute, addFromTabParam };
