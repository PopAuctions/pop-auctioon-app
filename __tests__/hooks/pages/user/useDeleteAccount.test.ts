import { act, renderHook } from '@testing-library/react-native';
import { useDeleteAccount } from '@/hooks/pages/user/useDeleteAccount';

const mockSecureDelete = jest.fn();
const mockCallToast = jest.fn();
const mockForceLogout = jest.fn();

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({ secureDelete: mockSecureDelete }),
}));
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ callToast: mockCallToast }),
}));
jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({ forceLogout: mockForceLogout }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

it('uses the local success message key and logs out', async () => {
  mockSecureDelete.mockResolvedValue({
    data: { en: 'legacy en', es: 'legacy es' },
    error: undefined,
    success: { en: 'legacy en', es: 'legacy es' },
  });

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  expect(mockForceLogout).toHaveBeenCalledTimes(1);
  expect(mockCallToast).toHaveBeenCalledWith({
    variant: 'success',
    description: 'account.deletedSuccessfully',
  });
  expect(response).toEqual({ message: 'account.deletedSuccessfully' });
});

it('uses the fallback error message key when the API omits one', async () => {
  mockSecureDelete.mockResolvedValue({
    data: null,
    error: { en: 'error en', es: 'error es' },
  });

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  expect(mockForceLogout).not.toHaveBeenCalled();
  expect(mockCallToast).toHaveBeenCalledWith({
    variant: 'error',
    description: 'errors.server.connection',
  });
  expect(response).toEqual({ message: 'errors.server.connection' });
});

it('builds unexpected-error messages for every supported language', async () => {
  mockSecureDelete.mockRejectedValue(new Error('network'));

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response: Awaited<ReturnType<typeof result.current.deleteAccount>>;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  expect(mockCallToast).toHaveBeenCalledWith({
    variant: 'error',
    description: 'errors.account.deleteUnexpected',
  });
  expect(response).toEqual({ message: 'errors.account.deleteRetryLater' });
});
