import React from 'react';
import { render } from '@testing-library/react-native';
import { AuctionDisplayDateTime } from '@/components/auctions/AuctionDisplayDateTime';

describe('AuctionDisplayDateTime', () => {
  const testDate = '2024-12-25T15:30:00.000Z';

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
        />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render date in English', () => {
      const { getByText } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
        />
      );

      // Date should be formatted in English locale
      expect(getByText(/December/i)).toBeTruthy();
    });

    it('should render date in Spanish', () => {
      const { getByText } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='es'
        />
      );

      // Date should be formatted in Spanish locale
      expect(getByText(/diciembre/i)).toBeTruthy();
    });
  });

  describe('Display options', () => {
    it('should display time by default', () => {
      const { toJSON } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should hide time when displayTime is false', () => {
      const { toJSON } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
          displayTime={false}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render in single line mode', () => {
      const { toJSON } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
          singleLine={true}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('should render in single line mode without time', () => {
      const { toJSON } = render(
        <AuctionDisplayDateTime
          startDate={testDate}
          locale='en'
          singleLine={true}
          displayTime={false}
        />
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Date formatting', () => {
    it('should handle different date strings', () => {
      const dates = [
        '2024-01-01T00:00:00.000Z',
        '2024-06-15T12:30:00.000Z',
        '2024-12-31T23:59:59.000Z',
      ];

      dates.forEach((date) => {
        const { toJSON } = render(
          <AuctionDisplayDateTime
            startDate={date}
            locale='en'
          />
        );

        expect(toJSON()).toBeTruthy();
      });
    });
  });
});
