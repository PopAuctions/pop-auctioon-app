import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  style,
  ...props
}) => {
  return (
    <TextInput
      className={`
        border-silver
        text-text-black
        focus:border-cinnabar
        h-12
        w-full
        rounded-lg
        border
        bg-white
        px-3
        py-3
        text-base
        shadow-sm
        disabled:opacity-50
        ${className}
      `}
      placeholderTextColor='#64748b'
      style={style}
      {...props}
    />
  );
};

Input.displayName = 'Input';
