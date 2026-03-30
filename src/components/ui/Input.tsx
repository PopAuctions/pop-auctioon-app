import { cn } from '@/utils/cn';
import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ className = '', style, editable = true, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          `
          h-12
          w-full
          rounded-lg
          border
          border-black
          bg-white
          px-3
          py-3
          text-base
          text-text-black
          shadow-sm
          focus:border-cinnabar
          disabled:opacity-50
          md:h-14
          md:text-lg
          ${editable ? '' : 'opacity-50'}
        `,
          className
        )}
        placeholderTextColor='#64748b'
        style={style}
        editable={editable}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
