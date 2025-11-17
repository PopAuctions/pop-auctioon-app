import React from 'react';
import { render } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyPaymentHistory } from '@/components/payment-history/EmptyPaymentHistory';

// Mock useTranslation
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'screens.paymentsHistory.title': 'Payments History',
        'screens.paymentsHistory.noPaymentsYet':
          'You have no registered payments',
        'screens.paymentsHistory.noPaymentsSubtitle':
          'Your purchases and payments will appear here',
      };
      return translations[key] || key;
    },
  }),
}));

describe('EmptyPaymentHistory', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders title correctly', () => {
      const { getByText } = render(
        <EmptyPaymentHistory
          refreshing={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(getByText('Payments History')).toBeTruthy();
    });

    it('renders empty state message', () => {
      const { getByText } = render(
        <EmptyPaymentHistory
          refreshing={false}
          onRefresh={mockOnRefresh}
        />
      );

      expect(getByText('You have no registered payments')).toBeTruthy();
    });
  });

  describe('Pull to refresh', () => {
    it('passes refreshing prop to RefreshControl', () => {
      const { UNSAFE_getByType } = render(
        <EmptyPaymentHistory
          refreshing={true}
          onRefresh={mockOnRefresh}
        />
      );

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.refreshControl.props.refreshing).toBe(true);
    });

    it('passes onRefresh callback to RefreshControl', () => {
      const { UNSAFE_getByType } = render(
        <EmptyPaymentHistory
          refreshing={false}
          onRefresh={mockOnRefresh}
        />
      );

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.refreshControl.props.onRefresh).toBe(
        mockOnRefresh
      );
    });
  });

  describe('Layout', () => {
    it('renders SafeAreaView with correct edges', () => {
      const { UNSAFE_getByType } = render(
        <EmptyPaymentHistory
          refreshing={false}
          onRefresh={mockOnRefresh}
        />
      );

      const safeAreaView = UNSAFE_getByType(SafeAreaView);
      expect(safeAreaView.props.edges).toEqual(['bottom']);
    });

    it('renders ScrollView with centered content', () => {
      const { UNSAFE_getByType } = render(
        <EmptyPaymentHistory
          refreshing={false}
          onRefresh={mockOnRefresh}
        />
      );

      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.contentContainerClassName).toContain(
        'items-center'
      );
      expect(scrollView.props.contentContainerClassName).toContain(
        'justify-center'
      );
    });
  });
});
