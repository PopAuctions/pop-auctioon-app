import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';

type FA4Props = ComponentProps<typeof FontAwesome>;
type FA5Props = ComponentProps<typeof FontAwesome5>;
type FA6Props = ComponentProps<typeof FontAwesome6>;

type NormalIconProps = {
  variant?: 'normal';
  name: FA4Props['name'];
  size?: FA4Props['size'];
  color?: `#${string}` | 'cinnabar';
  style?: StyleProp<TextStyle>;
};

type LightIconProps = {
  variant: 'light';
  name: FA5Props['name'];
  size?: FA5Props['size'];
  color?: `#${string}` | 'cinnabar';
  style?: StyleProp<TextStyle>;
};

type BoldIconProps = {
  variant: 'bold';
  name: FA6Props['name'];
  size?: FA6Props['size'];
  color?: `#${string}` | 'cinnabar';
  style?: StyleProp<TextStyle>;
};

type FontAwesomeIconProps = NormalIconProps | LightIconProps | BoldIconProps;

/**
 * A wrapper component for FontAwesome icons that supports different variants.
 * Check https://icons.expo.fyi/Index for available icons.
 *
 * @param props - The properties for the FontAwesomeIcon component.
 * @returns A FontAwesome icon component.
 */
export function FontAwesomeIcon(props: FontAwesomeIconProps) {
  const { size, color, style } = props;
  const variant = props.variant ?? 'normal';
  const finalColor = color === 'cinnabar' ? '#d75639' : color;

  if (variant === 'light') {
    return (
      <FontAwesome6
        name={props.name as FA5Props['name']}
        size={size}
        color={finalColor}
        style={style}
      />
    );
  }

  if (variant === 'bold') {
    return (
      <FontAwesome
        name={props.name as FA6Props['name']}
        size={size}
        color={finalColor}
        style={style}
      />
    );
  }

  return (
    <FontAwesome5
      name={props.name as FA4Props['name']}
      size={size}
      color={finalColor}
      style={style}
    />
  );
}
