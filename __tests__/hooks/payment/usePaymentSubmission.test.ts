import { act, renderHook } from '@testing-library/react-native';
import { usePaymentSubmission } from '@/hooks/payment/usePaymentSubmission';

describe('usePaymentSubmission', () => {
  it('ignores repeated submissions until the entire flow finishes', async () => {
    const { result } = renderHook(() => usePaymentSubmission());
    let finishCheck!: () => void;
    let finishCreation!: () => void;
    const check = new Promise<void>((resolve) => {
      finishCheck = resolve;
    });
    const creation = new Promise<void>((resolve) => {
      finishCreation = resolve;
    });
    const createPayment = jest.fn(() => creation);
    const submit = jest.fn(async () => {
      await check;
      await createPayment();
    });

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.runPaymentSubmission(submit);
      await result.current.runPaymentSubmission(submit);
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmittingPayment).toBe(true);

    await act(async () => {
      finishCheck();
    });
    expect(createPayment).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.runPaymentSubmission(submit);
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmittingPayment).toBe(true);

    await act(async () => {
      finishCreation();
      await first;
    });
    expect(result.current.isSubmittingPayment).toBe(false);
    await act(async () => {
      await result.current.runPaymentSubmission(submit);
    });
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it('releases the guard after an error so the user can retry', async () => {
    const { result } = renderHook(() => usePaymentSubmission());
    const error = new Error('failed');
    await act(async () => {
      await expect(
        result.current.runPaymentSubmission(async () => {
          throw error;
        })
      ).rejects.toBe(error);
    });
    expect(result.current.isSubmittingPayment).toBe(false);
    const retry = jest.fn(async () => {});
    await act(async () => {
      await result.current.runPaymentSubmission(retry);
    });
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
