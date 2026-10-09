import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useUpdateProfile } from '@/hooks/pages/user/useUpdateProfile';

const mockSecurePost = jest.fn();

jest.mock('@/hooks/api/useSecureApi', () => ({
  useSecureApi: () => ({ securePost: mockSecurePost }),
}));
jest.mock('@/lib/error/sentry-error-report', () => ({
  sentryErrorReport: jest.fn(),
}));

const profile = {
  username: 'buyer',
  name: 'Buyer',
  lastName: 'Test',
  phoneNumber: '600000000',
  profilePicture: '',
  oldProfilePicture: '',
  oldPhoneNumber: '600000000',
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('preserves the JSON profile-update request and success state', async () => {
  mockSecurePost.mockResolvedValue({ data: {}, error: undefined });
  const { result } = renderHook(() => useUpdateProfile());

  await act(async () => {
    await result.current.updateProfile(profile);
  });

  expect(mockSecurePost).toHaveBeenCalledWith({
    endpoint: expect.any(String),
    data: {
      username: profile.username,
      name: profile.name,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      oldProfilePicture: profile.oldProfilePicture,
      oldPhoneNumber: profile.oldPhoneNumber,
    },
  });
  expect(result.current.status).toBe('success');
  expect(result.current.errorMessage).toBeNull();
});

it('does not upload the existing remote profile picture again', async () => {
  mockSecurePost.mockResolvedValue({ data: {}, error: undefined });
  const currentProfilePicture =
    'http://localhost:3000/images/00_profile_pictures/buyer.webp';
  const { result } = renderHook(() => useUpdateProfile());

  await act(async () => {
    await result.current.updateProfile({
      ...profile,
      profilePicture: currentProfilePicture,
      oldProfilePicture: currentProfilePicture,
    });
  });

  expect(mockSecurePost).toHaveBeenCalledWith({
    endpoint: expect.any(String),
    data: expect.objectContaining({
      username: profile.username,
      oldProfilePicture: currentProfilePicture,
    }),
  });
  expect(mockSecurePost.mock.calls[0][0].data).not.toBeInstanceOf(FormData);
  expect(result.current.status).toBe('success');
});

it('keeps using multipart data when a new local profile picture is selected', async () => {
  mockSecurePost.mockResolvedValue({ data: {}, error: undefined });
  const { result } = renderHook(() => useUpdateProfile());

  await act(async () => {
    await result.current.updateProfile({
      ...profile,
      profilePicture: 'file:///cache/new-profile.webp',
      oldProfilePicture: 'https://example.com/current-profile.webp',
    });
  });

  expect(mockSecurePost).toHaveBeenCalledWith({
    endpoint: expect.any(String),
    data: expect.any(FormData),
    options: { timeout: 30000 },
  });
  expect(result.current.status).toBe('success');
});

it('keeps API errors unchanged', async () => {
  const error = { en: 'error en', es: 'error es' };
  mockSecurePost.mockResolvedValue({ data: null, error });
  const { result } = renderHook(() => useUpdateProfile());

  await act(async () => {
    await result.current.updateProfile(profile);
  });

  expect(result.current.status).toBe('error');
  expect(result.current.errorMessage).toBe(error);
});

it('builds unexpected profile errors for every supported language', async () => {
  mockSecurePost.mockRejectedValue(new Error('network'));
  const { result } = renderHook(() => useUpdateProfile());

  await act(async () => {
    await result.current.updateProfile(profile);
  });

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(Object.keys(result.current.errorMessage ?? {}).sort()).toEqual([
    'en',
    'es',
  ]);
});
