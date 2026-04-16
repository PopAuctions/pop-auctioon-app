/**
 * Stripe Provider Component
 * Envuelve la aplicación con StripeProvider siguiendo los patrones del proyecto
 */

import React from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import { CustomError } from '@/components/ui/CustomError';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

interface StripeProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

const STRIPE_PUBLIC_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || '';

export function StripeProvider({ children }: StripeProviderProps) {
  if (!STRIPE_PUBLIC_KEY) {
    sentryErrorReport(
      'Stripe configuration error: STRIPE_PUBLIC_KEY is not defined',
      'StripeProvider'
    );
    return (
      <CustomError
        customMessage={{
          es: 'Error de configuración. Por favor, contacta al soporte.',
          en: 'Configuration error. Please contact support.',
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
