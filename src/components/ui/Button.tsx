import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

export type ButtonMode = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  mode: ButtonMode;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
}

export const BUTTON_MODE_STYLES = {
  primary: 'bg-cinnabar text-white',
  secondary: 'bg-white text-cinnabar border border-silver',
};

const BUTTON_SIZE_STYLES = {
  primary: {
    small: 'px-4 py-2',
    large: 'px-7 py-3',
  },
  secondary: {
    small: 'px-[15px] py-[7px]',
    large: 'px-[27px] py-[11px]',
  },
};

export const Button: React.FC<ButtonProps> = ({
  mode,
  children,
  size = 'large',
  isLoading = false,
  disabled = false,
  style,
  ...props
}) => {
  const modeStyle = BUTTON_MODE_STYLES[mode];
  const sizeStyle = BUTTON_SIZE_STYLES[mode][size];

  const isDisabled = disabled || isLoading;

  // Colors for loading spinner
  const loadingColor = mode === 'primary' ? 'white' : '#d75639';

  return (
    <TouchableOpacity
      className={`
        ${modeStyle}
        ${sizeStyle}
        relative 
        flex-row 
        items-center 
        justify-center 
        rounded-lg 
        shadow-sm
        ${isDisabled ? 'opacity-50' : 'active:scale-95'}
      `}
      disabled={isDisabled}
      style={style}
      {...props}
    >
      {isLoading ? (
        <View className='absolute inset-0 flex-row items-center justify-center'>
          <ActivityIndicator
            color={loadingColor}
            size='small'
            style={{ marginRight: 8 }}
          />
          <Text
            className={`
              ${mode === 'primary' ? 'text-white' : 'text-cinnabar'}
              text-lg
              font-normal
              opacity-70
            `}
          >
            Cargando...
          </Text>
        </View>
      ) : null}

      <Text
        className={`
          ${mode === 'primary' ? 'text-white' : 'text-cinnabar'}
          text-center
          text-lg
          font-normal
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

Button.displayName = 'Button';
