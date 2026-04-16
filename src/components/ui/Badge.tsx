import React from 'react';
import { View } from 'react-native';
import { cn } from '@/utils/cn';
import { CustomText } from './CustomText';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const VARIANT_CONTAINER_CLASSES: Record<BadgeVariant, string> = {
  default: 'border bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  outline: 'border border-neutral-400',
};

const VARIANT_TEXT_CLASSES: Record<BadgeVariant, string> = {
  default: 'text-cinnabar',
  secondary: 'text-secondary-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  className,
  children,
}: BadgeProps) {
  return (
    <View
      className={cn(
        'flex items-center rounded-md px-2 py-1',
        VARIANT_CONTAINER_CLASSES[variant],
        className
      )}
    >
      <CustomText
        type='body'
        className={cn('text-base font-semibold', VARIANT_TEXT_CLASSES[variant])}
      >
        {children}
      </CustomText>
    </View>
  );
}
