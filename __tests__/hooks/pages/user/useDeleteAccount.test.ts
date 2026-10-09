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

it('prefers the locally translated success message and logs out', async () => {
  const success = { en: 'local en', es: 'local es' };
  mockSecureDelete.mockResolvedValue({
    data: { en: 'legacy en', es: 'legacy es' },
    error: undefined,
    success,
  });

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  expect(mockForceLogout).toHaveBeenCalledTimes(1);
  expect(mockCallToast).toHaveBeenCalledWith({
    variant: 'success',
    description: success,
  });
  expect(response).toEqual({ message: success });
});

it('keeps API errors unchanged', async () => {
  const error = { en: 'error en', es: 'error es' };
  mockSecureDelete.mockResolvedValue({ data: null, error });

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  expect(mockForceLogout).not.toHaveBeenCalled();
  expect(mockCallToast).toHaveBeenCalledWith({
    variant: 'error',
    description: error,
  });
  expect(response).toEqual({ message: error });
});

it('builds unexpected-error messages for every supported language', async () => {
  mockSecureDelete.mockRejectedValue(new Error('network'));

  const { result } = renderHook(() => useDeleteAccount('en'));
  let response: Awaited<ReturnType<typeof result.current.deleteAccount>>;

  await act(async () => {
    response = await result.current.deleteAccount();
  });

  const toastDescription = mockCallToast.mock.calls[0][0].description;
  expect(Object.keys(toastDescription).sort()).toEqual(['en', 'es']);
  expect(Object.keys(response!.message ?? {}).sort()).toEqual(['en', 'es']);
});
