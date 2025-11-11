/**
 * Centralized test mocks for Jest
 * Import these mocks in your test files to avoid repetition
 */

/**
 * Mock for Supabase client with authentication and realtime features
 * Use this in tests that interact with Supabase (auth, subscriptions, etc.)
 *
 * @example
 * import { mockSupabase } from '../../setup/mocks.mock';
 * jest.mock('@/utils/supabase/supabase-store', () => mockSupabase);
 *
 * // In your test, add jest.fn() if you need to track calls:
 * const mockSupabaseInternal = supabase as any;
 * mockSupabaseInternal.rpc = jest.fn();
 */
export const mockSupabase = {
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    // RPC method for database function calls
    rpc: () => Promise.resolve({ data: null, error: null }),
    // Realtime subscription methods for components that use channels
    getChannels: () => [],
    channel: () => ({
      on: () => ({
        on: () => ({}),
        subscribe: () => {},
        unsubscribe: () => {},
      }),
      subscribe: () => {},
      unsubscribe: () => {},
    }),
  },
};
/**
 * Mock for React Native SafeAreaContext
 * Use this in tests that render components using SafeAreaProvider/SafeAreaView
 *
 * @example
 * import { mockSafeAreaContext } from '@/__tests__/setup/mocks.mock';
 * jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
 */
export const mockSafeAreaContext = {
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  initialWindowMetrics: {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  },
};

/**
 * Mock for expo-image-picker
 * Use this in tests that involve image selection
 *
 * @example
 * import { mockImagePicker } from '@/__tests__/setup/mocks.mock';
 * jest.mock('expo-image-picker', () => mockImagePicker);
 */
export const mockImagePicker = {
  launchImageLibraryAsync: () =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }],
    }),
  requestMediaLibraryPermissionsAsync: () =>
    Promise.resolve({ status: 'granted' }),
  MediaTypeOptions: {
    Images: 'Images',
  },
};

/**
 * Mock for React Navigation
 * Use this in tests that use navigation hooks
 *
 * @example
 * import { mockNavigation } from '@/__tests__/setup/mocks.mock';
 * jest.mock('expo-router', () => mockNavigation);
 */
export const mockNavigation = {
  useRouter: () => ({
    push: () => {},
    back: () => {},
    replace: () => {},
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  Link: ({ children }: any) => children,
};

/**
 * Mock for useSecureApi hook
 * Use this in tests that make API calls
 *
 * @example
 * import { mockSecureApi } from '@/__tests__/setup/mocks.mock';
 * jest.mock('@/hooks/api/useSecureApi', () => ({ useSecureApi: () => mockSecureApi }));
 */
export const mockSecureApi = {
  secureGet: () => Promise.resolve({ data: null, error: null }),
  securePost: () => Promise.resolve({ data: null, error: null }),
  securePut: () => Promise.resolve({ data: null, error: null }),
  secureDelete: () => Promise.resolve({ data: null, error: null }),
  protectedGet: () => Promise.resolve({ data: null, error: null }),
  protectedPost: () => Promise.resolve({ data: null, error: null }),
};

/**
 * Mock for useTranslation hook
 * Use this in tests that need i18n
 *
 * @example
 * import { mockTranslation } from '@/__tests__/setup/mocks.mock';
 * jest.mock('@/hooks/i18n/useTranslation', () => ({ useTranslation: () => mockTranslation }));
 */
export const mockTranslation = {
  t: (key: string) => key,
  locale: 'en' as const,
  changeLanguage: () => {},
  isPending: false,
};

/**
 * Mock for useAuth hook
 * Use this in tests that need authentication context
 *
 * @example
 * import { mockAuth, mockAuthUnauthenticated } from '@/__tests__/setup/mocks.mock';
 * jest.mock('@/context/auth-context', () => ({ useAuth: () => mockAuth }));
 */
export const mockAuth = {
  auth: {
    state: 'authenticated' as const,
    session: {
      user: { id: '1', email: 'test@test.com' },
      access_token: 'mock-token',
    },
    role: 'USER' as const,
  },
  getSession: () =>
    [
      { user: { id: '1', email: 'test@test.com' }, access_token: 'mock-token' },
      'USER' as const,
    ] as const,
};

export const mockAuthUnauthenticated = {
  auth: {
    state: 'unauthenticated' as const,
  },
  getSession: () => [null, null] as const,
};

/**
 * Helper function to create a mock article object
 * Use this when testing components that need article data
 */
export const createMockArticle = (overrides?: any) => ({
  id: 1,
  title: 'Test Article',
  images: ['https://example.com/image.jpg'],
  brand: 'LOUIS_VUITTON',
  endDate: new Date().toISOString(),
  ArticleBid: {
    currentValue: 100,
  },
  ...overrides,
});

/**
 * Helper function to create a mock auction language object
 * Use this when testing components that need auction translations
 */
export const createMockAuctionLang = (overrides?: any) => ({
  follow: 'Follow',
  unfollow: 'Unfollow',
  share: 'Share',
  articles: 'Articles',
  currentBid: 'Current Bid',
  estimatedPrice: 'Estimated Price',
  waiting1: 'Auction will start soon!',
  waiting2: 'Wait a few minutes',
  start: 'Auction already started!',
  finished: 'Auction finished',
  watchButton: 'Watch live',
  ended: 'Auction finished',
  timeStart: 'Time to start:',
  auctionNotFound: 'Auction not found',
  noArticlesFound: 'No articles found',
  specialMessage: 'No commission',
  ...overrides,
});
