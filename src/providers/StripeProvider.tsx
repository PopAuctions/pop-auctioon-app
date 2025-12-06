/**
 * Stripe Provider Component
 * Envuelve la aplicación con StripeProvider siguiendo los patrones del proyecto
 */

import React from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

const STRIPE_PUBLIC_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || '';

export function StripeProvider({ children }: StripeProviderProps) {
  if (!STRIPE_PUBLIC_KEY) {
    console.error('STRIPE_PUBLIC_KEY is not defined in environment variables');
  }

  return (
    <StripeProviderNative publishableKey={STRIPE_PUBLIC_KEY}>
      {children}
    </StripeProviderNative>
  );
}
