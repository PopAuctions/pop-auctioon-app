/**
 * Stripe Provider Component
 * Envuelve la aplicación con StripeProvider siguiendo los patrones del proyecto
 */

import React from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import { CustomError } from '@/components/ui/CustomError';

interface StripeProviderProps {
  children: React.ReactNode;
}

const STRIPE_PUBLIC_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || '';

export function StripeProvider({ children }: StripeProviderProps) {
  if (!STRIPE_PUBLIC_KEY) {
    return (
      <CustomError
        customMessage={{
          es: 'Error de configuración: STRIPE_PUBLIC_KEY no está definida. Por favor revisa tu archivo .env.local',
          en: 'Configuration error: STRIPE_PUBLIC_KEY is not defined. Please check your .env.local file',
        }}
        refreshRoute='/(tabs)/home'
      />
    );
  }

  return (
    <StripeProviderNative publishableKey={STRIPE_PUBLIC_KEY}>
      {children}
    </StripeProviderNative>
  );
}
