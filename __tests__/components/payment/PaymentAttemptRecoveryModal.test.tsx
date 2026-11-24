import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { PaymentAttemptRecoveryModal } from '@/components/payment/PaymentAttemptRecoveryModal';

jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PaymentAttemptRecoveryModal', () => {
  it('keeps long article lists, the warning and both actions in the scrollable content', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const articleTitles = Array.from(
      { length: 20 },
      (_, index) => `Article ${index + 1} with a long title`
    );
    render(
      <PaymentAttemptRecoveryModal
        visible
        isSubmitting={false}
        articleTitles={articleTitles}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    const scroll = screen.getByTestId('payment-recovery-scroll');
    expect(
      scroll.findByProps({ children: 'screens.payment.paymentRecoveryWarning' })
    ).toBeTruthy();
    expect(
      within(scroll).getByText('Article 20 with a long title', { exact: false })
    ).toBeTruthy();
    fireEvent.press(
      within(scroll).getByRole('button', { name: 'common.actions.cancel' })
    );
    fireEvent.press(
      within(scroll).getByRole('button', {
        name: 'screens.payment.paymentRecoveryConfirm',
      })
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables both actions while submitting', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
      <PaymentAttemptRecoveryModal
        visible
        isSubmitting
        articleTitles={['Article']}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    expect(
      screen.getByRole('button', { name: 'common.actions.cancel' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'screens.payment.paymentRecoveryConfirm',
      })
    ).toBeDisabled();
  });
});
