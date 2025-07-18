/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;

  // Siempre llamar al hook, pero usar el resultado condicionalmente
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const shouldApplyThemeColor = lightColor || darkColor;
  const color = shouldApplyThemeColor ? themeColor : undefined;

  return <DefaultText style={[color ? { color } : {}, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;

  // Siempre llamar al hook, pero usar el resultado condicionalmente
  const themeBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const shouldApplyThemeColor = lightColor || darkColor;
  const backgroundColor = shouldApplyThemeColor ? themeBackgroundColor : undefined;

  return <DefaultView style={[backgroundColor ? { backgroundColor } : {}, style]} {...otherProps} />;
}