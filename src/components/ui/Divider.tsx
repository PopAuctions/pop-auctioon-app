import { View, StyleProp, ViewStyle } from 'react-native';
import { cn } from '@/utils/cn';

type DividerProps = {
  className?: string;
  style?: StyleProp<ViewStyle>;
  orientation?: 'horizontal' | 'vertical';
};

export function Divider({
  className = '',
  style = {},
  orientation = 'horizontal',
}: DividerProps) {
  const orientationClasses =
    orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px';

  return (
    <View
      className={cn(`rounded-lg bg-[#232323]`, orientationClasses, className)}
      style={style}
    />
  );
}
