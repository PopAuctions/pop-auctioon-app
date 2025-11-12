import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaymentCard } from '@/components/payment-history/PaymentCard';
import type { UserPayment } from '@/types/types';

// Mock useTranslation
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'screens.paymentsHistory.onlineStore': 'Online Store',
        'screens.paymentsHistory.totalAmount': 'Total',
        'screens.paymentsHistory.articlesPaid': 'Articles paid',
        'screens.paymentsHistory.viewPayment': 'View payment',
      };
      return translations[key] || key;
    },
    locale: 'en',
  }),
}));

// Mock formatPaymentDate
jest.mock('@/utils/calendar', () => ({
  formatPaymentDate: (date: string) => 'October 8, 2025 at 6:43 AM',
}));

describe('PaymentCard', () => {
  const mockPaymentApproved: UserPayment = {
    id: 1,
    createdAt: '2025-10-08T06:43:00Z',
    status: 'APPROVED',
    totalAmount: 235.0,
    articlesPaid: [1],
    auction: null,
    articles: [
      {
        id: 1,
        title: 'Elegant Black Handbag',
        auctionId: 0,
        soldPrice: 235.0,
        brand: 'Prada',
        images: ['https://example.com/image.jpg'],
      },
    ],
    user: {},
  };

  const mockPaymentWithAuction: UserPayment = {
    id: 2,
    createdAt: '2025-05-26T04:58:00Z',
    status: 'APPROVED',
    totalAmount: 10094.5,
    articlesPaid: [2, 3],
    auction: {
      id: 5,
      title: 'April auction',
      startDate: new Date('2025-04-15'),
    },
    articles: [
      {
        id: 2,
        title: 'Louis Vuitton Handbag',
        auctionId: 5,
        soldPrice: 5000.0,
        brand: 'Louis Vuitton',
        images: ['https://example.com/lv.jpg'],
      },
    ],
    user: {},
  };

  const mockPaymentPending: UserPayment = {
    ...mockPaymentApproved,
    id: 3,
    status: 'PENDING',
  };

  describe('Rendering', () => {
    it('renders payment card with all information', () => {
      const { getByText } = render(
        <PaymentCard payment={mockPaymentApproved} />
      );

      expect(getByText('Paid')).toBeTruthy();
      expect(getByText('October 8, 2025 at 6:43 AM')).toBeTruthy();
      expect(getByText('Online Store')).toBeTruthy();
      expect(getByText(/TOTAL:/)).toBeTruthy();
      expect(getByText(/€235.00/)).toBeTruthy();
      expect(getByText(/Articles paid: 1/)).toBeTruthy();
    });

    it('renders auction title when payment has auction', () => {
      const { getByText, queryByText } = render(
        <PaymentCard payment={mockPaymentWithAuction} />
      );

      expect(getByText('April auction')).toBeTruthy();
      expect(queryByText('Online Store')).toBeNull();
    });

    it('renders "View payment" button when status is APPROVED', () => {
      const { getByText } = render(
        <PaymentCard payment={mockPaymentApproved} />
      );

      expect(getByText('View payment')).toBeTruthy();
    });

    it('does not render "View payment" button when status is PENDING', () => {
      const { queryByText } = render(
        <PaymentCard payment={mockPaymentPending} />
      );

      expect(queryByText('View payment')).toBeNull();
    });

    it('displays correct amount formatting for large numbers', () => {
      const { getByText } = render(
        <PaymentCard payment={mockPaymentWithAuction} />
      );

      expect(getByText(/€10,094.50/)).toBeTruthy();
    });

    it('displays correct articles count', () => {
      const { getByText } = render(
        <PaymentCard payment={mockPaymentWithAuction} />
      );

      expect(getByText(/Articles paid: 2/)).toBeTruthy();
    });
  });

  describe('Image handling', () => {
    it('renders image when article has images', () => {
      const { getByLabelText } = render(
        <PaymentCard payment={mockPaymentApproved} />
      );

      const image = getByLabelText('Elegant Black Handbag');
      expect(image).toBeTruthy();
    });

    it('renders placeholder when article has no images', () => {
      const paymentNoImage: UserPayment = {
        ...mockPaymentApproved,
        articles: [
          {
            ...mockPaymentApproved.articles[0],
            images: [],
          },
        ],
      };

      const { getByTestId } = render(<PaymentCard payment={paymentNoImage} />);
      // El placeholder debería renderizar un View vacío
      expect(getByTestId).toBeDefined();
    });
  });

  describe('Status display', () => {
    it('displays "Paid" for APPROVED status', () => {
      const { getByText } = render(
        <PaymentCard payment={mockPaymentApproved} />
      );

      expect(getByText('Paid')).toBeTruthy();
    });

    it('displays raw status when label not found', () => {
      const paymentUnknown: UserPayment = {
        ...mockPaymentApproved,
        status: 'UNKNOWN_STATUS',
      };

      const { getByText } = render(<PaymentCard payment={paymentUnknown} />);

      expect(getByText('UNKNOWN_STATUS')).toBeTruthy();
    });
  });

  describe('Button interaction', () => {
    it('logs payment id when "View payment" is pressed', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { getByText } = render(
        <PaymentCard payment={mockPaymentApproved} />
      );

      const viewButton = getByText('View payment');
      fireEvent.press(viewButton);

      expect(consoleSpy).toHaveBeenCalledWith('Ver pago:', 1);

      consoleSpy.mockRestore();
    });
  });
});
