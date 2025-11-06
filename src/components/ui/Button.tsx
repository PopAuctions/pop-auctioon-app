import { cn } from '@/utils/cn';
import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  type PressableProps,
} from 'react-native';

export type ButtonMode = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'large';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  mode: ButtonMode;
  size?: ButtonSize;
  className?: string; // NativeWind
  isLoading?: boolean;
  textClassName?: string; // (optional) style text separately if needed
  testID?: string;
}

export const BUTTON_MODE_STYLES: Record<ButtonMode, string> = {
  primary: 'bg-cinnabar text-white',
  secondary: 'bg-white border border-silver text-cinnabar',
};

export const BUTTON_SIZE_STYLES: Record<
  ButtonMode,
  Record<ButtonSize, string>
> = {
  primary: {
    small: 'px-4 py-2',
    large: 'px-7 py-3',
  },
  secondary: {
    small: 'px-[15px] py-[7px]',
    large: 'px-[27px] py-[11px]',
  },
};

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      mode,
      size = 'large',
      className,
      textClassName,
      isLoading,
      disabled,
      children,
      testID = 'ui-button',
      onPress,
      ...props
    },
    ref
  ) => {
    const modeStyle = BUTTON_MODE_STYLES[mode];
    const sizeStyle = BUTTON_SIZE_STYLES[mode][size];

    const spinnerColor =
      mode === 'primary' ? '#ffffff' : '#d75639'; /* cinnabar */
    const textColorForMode =
      mode === 'primary' ? 'text-white' : 'text-cinnabar';

    return (
      <Pressable
        ref={ref}
        android_ripple={{
          color:
            mode === 'primary'
              ? 'rgb(215, 86, 57)' /* cinnabar */
              : 'rgb(255,255,255)',
          borderless: false,
        }}
        accessibilityRole='button'
        accessibilityState={{ disabled: !!disabled, busy: !!isLoading }}
        disabled={disabled || isLoading}
        className={cn(
          'relative flex-row items-center justify-center gap-3 rounded-lg',
          'transition-all duration-200 ease-out',
          'active:scale-95',
          (disabled || isLoading) && 'opacity-50',
          modeStyle,
          sizeStyle,
          className
        )}
        // Smooth “pressed” feedback on native
        style={({ pressed }) => [
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
        onPress={onPress}
        testID={testID}
        {...props}
      >
        <View
          className={cn(
            isLoading ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-150'
          )}
          pointerEvents='none'
        >
          {typeof children === 'string' ? (
            <Text className={cn('text-lg', textColorForMode, textClassName)}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>

        {isLoading && (
          <View
            className='absolute inset-0 items-center justify-center'
            pointerEvents='none'
            accessibilityLiveRegion={
              Platform.OS === 'android' ? 'polite' : undefined
            }
          >
            <ActivityIndicator
              size='small'
              color={spinnerColor}
            />
          </View>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
