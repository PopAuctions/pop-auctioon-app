import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

// Mock AsyncStorage BEFORE any imports that use it
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/__tests__/setup/mocks.mock').mockAsyncStorage
);

// Mock Supabase store to prevent AsyncStorage errors
jest.mock(
  '@/utils/supabase/supabase-store',
  () => require('@/__tests__/setup/mocks.mock').mockSupabase
);

// Mock CustomError to avoid deep import chain
jest.mock('@/components/ui/CustomError', () => {
  const { Text } = require('react-native');
  return {
    CustomError: ({ customMessage }: any) => (
      <Text testID='custom-error'>
        {customMessage?.en || customMessage?.es}
      </Text>
    ),
  };
});

// Mock Stripe React Native
jest.mock('@stripe/stripe-react-native', () => {
  const { Text } = require('react-native');
  return {
    StripeProvider: ({ children, publishableKey }: any) => (
      <>
        <Text testID='stripe-key'>{publishableKey}</Text>
        {children}
      </>
    ),
  };
});

import { StripeProvider } from '@/providers/StripeProvider';

describe('StripeProvider', () => {
  const originalEnv = process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY;

  afterEach(() => {
    if (originalEnv) {
      process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = originalEnv;
    } else {
      delete process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY;
    }
    jest.resetModules();
  });

  it('should render children correctly', () => {
    // Set env before requiring the module
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = 'pk_test_123';

    // Force re-import to pick up new env
    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByText } = render(
        <StripeProvider>
          <Text>Test Child</Text>
        </StripeProvider>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });
  });

  it('should pass publishable key to Stripe provider', () => {
    const testKey = 'pk_test_abcd1234';
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = testKey;

    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByTestId } = render(
        <StripeProvider>
          <Text>Child</Text>
        </StripeProvider>
      );

      expect(getByTestId('stripe-key').props.children).toBe(testKey);
    });
  });

  it('should show error when publishable key is missing', () => {
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = '';

    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByTestId } = render(
        <StripeProvider>
          <Text>Child</Text>
        </StripeProvider>
      );

      const errorText = getByTestId('custom-error').props.children;
      expect(errorText).toContain('STRIPE_PUBLIC_KEY');
    });
  });

  it('should show error when key is undefined', () => {
    delete process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY;

    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByTestId } = render(
        <StripeProvider>
          <Text>Child</Text>
        </StripeProvider>
      );

      expect(getByTestId('custom-error')).toBeTruthy();
    });
  });

  it('should render multiple children', () => {
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = 'pk_test_123';

    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByText } = render(
        <StripeProvider>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
        </StripeProvider>
      );

      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
      expect(getByText('Child 3')).toBeTruthy();
    });
  });

  it('should accept production publishable key', () => {
    const prodKey = 'pk_live_abcd1234';
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = prodKey;

    jest.isolateModules(() => {
      const { StripeProvider } = require('@/providers/StripeProvider');

      const { getByTestId } = render(
        <StripeProvider>
          <Text>Child</Text>
        </StripeProvider>
      );

      expect(getByTestId('stripe-key').props.children).toBe(prodKey);
    });
  });
});
