import React from 'react';
import { render } from '@testing-library/react-native';
import { StripeProvider } from '@/providers/StripeProvider';

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

describe('StripeProvider', () => {
  const originalEnv = process.env;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error = originalConsoleError;
  });

  it('should render children correctly', () => {
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = 'pk_test_123';

    const { getByText } = render(
      <StripeProvider>
        <Text>Test Child</Text>
      </StripeProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should pass publishable key to Stripe provider', () => {
    const testKey = 'pk_test_abcd1234';
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = testKey;

    const { getByTestId } = render(
      <StripeProvider>
        <Text>Child</Text>
      </StripeProvider>
    );

    expect(getByTestId('stripe-key').props.children).toBe(testKey);
  });

  it('should log error when publishable key is missing', () => {
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = '';

    render(
      <StripeProvider>
        <Text>Child</Text>
      </StripeProvider>
    );

    expect(console.error).toHaveBeenCalledWith(
      'STRIPE_PUBLIC_KEY is not defined in environment variables'
    );
  });

  it('should pass empty string when key is undefined', () => {
    delete process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY;

    const { getByTestID } = render(
      <StripeProvider>
        <Text>Child</Text>
      </StripeProvider>
    );

    expect(getByTestID('stripe-key').props.children).toBe('');
  });

  it('should render multiple children', () => {
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = 'pk_test_123';

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

  it('should accept production publishable key', () => {
    const prodKey = 'pk_live_abcd1234';
    process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY = prodKey;

    const { getByTestId } = render(
      <StripeProvider>
        <Text>Child</Text>
      </StripeProvider>
    );

    expect(getByTestId('stripe-key').props.children).toBe(prodKey);
    expect(console.error).not.toHaveBeenCalled();
  });
});
