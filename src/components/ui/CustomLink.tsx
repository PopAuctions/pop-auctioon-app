import React, { forwardRef } from 'react';
import { Text, Linking, ViewStyle, Pressable } from 'react-native';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { cn } from '@/utils/cn';
import { Href, usePathname, useRouter } from 'expo-router';

/**
 * Tab routes (parent routes) - extracted from app/(tabs)/_layout.tsx
 */
const TAB_ROUTES = [
  '/(tabs)/home',
  '/(tabs)/auctions',
  '/(tabs)/online-store',
  '/(tabs)/auctioneer',
  '/(tabs)/account',
  '/(tabs)/auth',
] as const;

type TabRoute = (typeof TAB_ROUTES)[number];

function normalizeTabsPath(pathname: string): string {
  if (pathname.startsWith('/(tabs)/')) return pathname;

  // '/home' -> '/(tabs)/home', '/account/foo' -> '/(tabs)/account/foo'
  for (const tabRoute of TAB_ROUTES) {
    const tabName = tabRoute.replace('/(tabs)/', '');
    if (pathname === `/${tabName}` || pathname.startsWith(`/${tabName}/`)) {
      return `/(tabs)/${tabName}${pathname.slice(tabName.length + 1)}`;
    }
  }

  return pathname;
}

/**
 * Returns the tab root route for a given href, or null if it doesn't belong to a tab route.
 * Works with both '/(tabs)/account/...' and group-less '/account/...'
 */
function getTabRootFromHref(href: string): TabRoute | null {
  const [pathNoQuery] = href.split('?');
  const clean = normalizeTabsPath(pathNoQuery);

  const match = TAB_ROUTES.find(
    (tabRoute) => clean === tabRoute || clean.startsWith(tabRoute + '/')
  );

  return match ?? null;
}

/**
 * Adds fromTab=true ONLY when:
 * - destination belongs to a tab route AND is nested (not the tab root)
 * - AND navigation is cross-tab (current tab root !== destination tab root)
 */
function addFromTabParamIfCrossTab(
  href: string,
  currentPathname: string
): string {
  if (href.includes('fromTab=')) return href;

  const currentTab = getTabRootFromHref(currentPathname);
  const targetTab = getTabRootFromHref(href);

  if (!currentTab || !targetTab) return href;

  // detect nested: same tab root but not exactly the root path
  const [targetNoQuery] = href.split('?');
  const targetNormalized = normalizeTabsPath(targetNoQuery);
  const isTargetNested = targetNormalized !== targetTab;

  if (!isTargetNested) return href; // not nested → no marker
  if (currentTab === targetTab) return href; // same tab → no marker

  const [pathAndQuery, hash] = href.split('#');
  const separator = pathAndQuery.includes('?') ? '&' : '?';
  const result = `${pathAndQuery}${separator}fromTab=true`;
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
 * - '/(tabs)/auctioneer/my-auctions' -> Requiere autenticación + rol AUCTIONEER
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

      // Agregar automáticamente fromTab=true si es ruta anidada
      const finalHref = addFromTabParamIfCrossTab(href, pathname);

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
export { normalizeTabsPath, getTabRootFromHref, addFromTabParamIfCrossTab };
