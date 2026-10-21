import { act, renderHook } from '@testing-library/react-native';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { useArticlesPayment } from '@/hooks/pages/payment/useArticlesPayment';
import { useSingleArticlePayment } from '@/hooks/pages/payment/useSingleArticlePayment';
import { SECURE_ENDPOINTS } from '@/config/api-config';

jest.mock('@/hooks/api/useSecureApi');

const securePost = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useSecureApi).mockReturnValue({
    securePost,
    secureGet: jest.fn(),
    protectedGet: jest.fn(),
    protectedPost: jest.fn(),
  });
});

it('checks the store scope with the real article ID', async () => {
  const data = {
    recoverableArticleIds: [130],
    recoverablePendingAttemptIds: [24],
  };
  securePost.mockResolvedValueOnce({ error: null, data });
  const { result } = renderHook(() => useArticlesPayment());
  await act(async () => {
    await expect(
      result.current.checkPaymentAttemptRecovery({
        auctionId: null,
        articleIds: [130],
      })
    ).resolves.toEqual({ data, error: null });
  });
  expect(securePost).toHaveBeenCalledWith({
    endpoint: SECURE_ENDPOINTS.PAYMENT.CHECK_PAYMENT_ATTEMPT_RECOVERY,
    data: { auctionId: null, articleIds: [130] },
  });
});

it('forwards the offer ID and confirmed attempts when creating the payment', async () => {
  securePost.mockResolvedValueOnce({
    error: null,
    data: { userPaymentId: 25 },
  });
  const params = {
    articleId: '42',
    clientTotalAmount: 100,
    clientIntent: 'order',
    country: 'SPAIN',
    userAddressId: 'address',
    confirmedPendingAttemptIds: [24],
  };
  const { result } = renderHook(() => useSingleArticlePayment());
  await act(async () => {
    await expect(result.current.createPayment(params)).resolves.toEqual({
      userPaymentId: 25,
      error: null,
    });
  });
  expect(securePost).toHaveBeenCalledWith({
    endpoint: SECURE_ENDPOINTS.PAYMENT.CREATE_SINGLE_ARTICLE_PAYMENT,
    data: params,
  });
});
