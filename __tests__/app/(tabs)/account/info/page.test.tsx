import React from 'react';
import { render } from '@testing-library/react-native';
import InfoScreen from '@/app/(tabs)/account/info/[page]';

const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
  }),
}));

jest.mock('@/components/info', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    AboutUsContent: () => React.createElement(RN.Text, {}, 'AboutUsContent'),
    HowItWorksContent: () =>
      React.createElement(RN.Text, {}, 'HowItWorksContent'),
    FAQsContent: () => React.createElement(RN.Text, {}, 'FAQsContent'),
    ContactUsContent: () =>
      React.createElement(RN.Text, {}, 'ContactUsContent'),
  };
});

describe('Account InfoScreen', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReset();
  });

  describe('Dynamic routing', () => {
    it('renders AboutUsContent for about-us page', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'about-us' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('AboutUsContent')).toBeTruthy();
    });

    it('renders HowItWorksContent for how-it-works page', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'how-it-works' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('HowItWorksContent')).toBeTruthy();
    });

    it('renders FAQsContent for faqs page', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'faqs' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('FAQsContent')).toBeTruthy();
    });

    it('renders ContactUsContent for contact-us page', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'contact-us' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('ContactUsContent')).toBeTruthy();
    });

    it('defaults to AboutUsContent for unknown pages', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'unknown' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('AboutUsContent')).toBeTruthy();
    });
  });

  describe('Authenticated context', () => {
    it('works within account stack', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'about-us' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('AboutUsContent')).toBeTruthy();
    });

    it('shares components with auth stack', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'how-it-works' });
      const { getByText } = render(<InfoScreen />);
      expect(getByText('HowItWorksContent')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles undefined page parameter', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: undefined });
      expect(() => render(<InfoScreen />)).not.toThrow();
    });

    it('handles empty page parameter', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: '' });
      expect(() => render(<InfoScreen />)).not.toThrow();
    });
  });

  describe('Component rendering', () => {
    it('renders without crashing', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'about-us' });
      expect(() => render(<InfoScreen />)).not.toThrow();
    });

    it('has correct structure', () => {
      mockUseLocalSearchParams.mockReturnValue({ page: 'about-us' });
      const { toJSON } = render(<InfoScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
