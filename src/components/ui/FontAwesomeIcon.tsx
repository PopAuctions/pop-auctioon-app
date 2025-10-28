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
  color?: FA4Props['color'];
  style?: StyleProp<TextStyle>;
};

type LightIconProps = {
  variant: 'light';
  name: FA5Props['name'];
  size?: FA5Props['size'];
  color?: FA5Props['color'];
  style?: StyleProp<TextStyle>;
};

type BoldIconProps = {
  variant: 'bold';
  name: FA6Props['name'];
  size?: FA6Props['size'];
  color?: FA6Props['color'];
  style?: StyleProp<TextStyle>;
};

type FontAwesomeIconProps = NormalIconProps | LightIconProps | BoldIconProps;

export function FontAwesomeIcon(props: FontAwesomeIconProps) {
  const { size, color, style } = props;
  const variant = props.variant ?? 'normal';

  if (variant === 'light') {
    return (
      <FontAwesome6
        name={props.name as FA5Props['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  if (variant === 'bold') {
    return (
      <FontAwesome
        name={props.name as FA6Props['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <FontAwesome5
      name={props.name as FA4Props['name']}
      size={size}
      color={color}
      style={style}
    />
  );
}
