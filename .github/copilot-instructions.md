# PopAuction React Native App - AI Copilot Instructions

## Architecture Overview

This is a **React Native/Expo** auction application with **file-based routing** using `expo-router`. The app features role-based authentication via **Supabase** with secure API communication to a Next.js backend.

### Key Tech Stack

- **Expo SDK 53** with New Architecture enabled
- **React 19** with concurrent features (`useTransition` in i18n)
- **Expo Router v5.1+** (file-based routing with typed routes)
- **Supabase** (auth & database with complex schema in `src/types/supabase.ts`)
- **NativeWind v4.1+** (Tailwind CSS for React Native)
- **i18n-js v4.5+** (Spanish/English localization)
- **Sentry** (error tracking with PII scrubbing in `app/_layout.tsx`)
- **TypeScript** with strict configuration
- **Volta** (Node 22.19.0, npm 11.6.0 pinning)

### Project Structure Pattern

- `app/` - File-based routing (Expo Router v5.1+)
- `src/` - Business logic, components, hooks, utilities
- **Path aliases**: Extensive mapping in `tsconfig.json` and `jest.config.js` - always use `@/` imports

## Authentication & Authorization

### Core Pattern: Role-Based Access Control

```typescript
// Always use AuthContext for session/role checking
const { auth, getSession } = useAuth();
const [session, role] = getSession();

// Auth state is typed union for precise handling
type AuthState =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; session: Session; role: UserRoles | null };
```

**User Roles** (defined in `src/types/types.ts`):

- `USER`: Basic access (auctions, store, account)
- `AUCTIONEER`: Can create/manage auctions + all USER permissions

### Three-Layer Protection System

1. **ProtectedRoute component** (`src/components/navigation/ProtectedRoute.tsx`):
   - Wraps entire app in `app/_layout.tsx`
   - Auto-redirects based on auth state and route requirements
   - Handles role gating (waits for role resolution before access)

2. **Route configuration** (`src/components/navigation/routeConfig.ts`):
   - Centralized declarative config: `PROTECTED_ROUTES` object
   - Example: `'my-auctions': { requiredRole: 'AUCTIONEER' }` (empty object `{}` = any authenticated user)
   - Helper functions: `requiresAuth()`, `getRequiredRole()`, `hasAccess()`

3. **Navigation hooks** (`src/hooks/auth/useAuthNavigation.ts`):
   ```typescript
   const { navigateWithAuth } = useAuthNavigation();
   navigateWithAuth('/(tabs)/my-auctions'); // Auto-handles auth checking
   ```

### Session Management Details

- **LargeSecureStore** (`src/utils/supabase/supabase-store.ts`): Custom storage adapter for Supabase sessions >2048 bytes
  - Uses AES-256 encryption with key in SecureStore, encrypted data in AsyncStorage
  - Handles auto-refresh 30 seconds before token expiry
- **Auth flow**: `app/_layout.tsx` initializes `AuthProvider` → loads session → validates user → fetches role → schedules refresh

## Routing Architecture

### File-Based Routing Structure

```
app/(tabs)/           # Tab-based navigation (route groups)
├── index.tsx         # Redirect logic: unauthenticated → /auth, authenticated → /home
├── _layout.tsx       # Tab bar config with conditional visibility (see Tab Visibility)
├── auth/            # Auth flow (login, register)
├── home/            # Dashboard/API testing
├── auctions/        # Auction browsing/calendar
├── my-auctions/     # AUCTIONEER-only section
├── store/           # Product store
└── account/         # User profile/settings
```

**Layout Pattern**: Each section has `_layout.tsx` defining Stack navigation for sub-routes.

### Dynamic Routes

- Use `[id].tsx` for parameterized routes (e.g., `store/[id].tsx`)
- Access params: `const { id } = useLocalSearchParams()` from expo-router

### Tab Visibility Logic

Tabs are shown/hidden dynamically in `app/(tabs)/_layout.tsx`:

```typescript
const { getSession } = useAuth();
const [session, role] = getSession();

<Tabs.Screen
  name='my-auctions'
  options={{
    href: session && role === 'AUCTIONEER' ? undefined : null, // null = hidden
  }}
/>
```

### Smart Navigation Components

- **CustomLink** (`src/components/ui/CustomLink.tsx`):
  - Auto-detects auth requirements from `routeConfig.ts` - no manual auth props needed
  - Supports modes: `primary`, `secondary`, `plainText`, `empty`
  - Handles external links via `outsideRedirect` prop
  - Example: `<CustomLink href="/(tabs)/my-auctions" mode="primary">Go</CustomLink>`

## API Communication

### Dual Security Levels

Configuration in `src/config/api-config.ts`:

```typescript
// Protected endpoints (API key only)
PROTECTED_ENDPOINTS.EMAIL.SEND;
PROTECTED_ENDPOINTS.NOTIFICATIONS.SEND;

// Secure endpoints (JWT + API key)
SECURE_ENDPOINTS.AUCTIONS.CREATE;
SECURE_ENDPOINTS.USER.PROFILE;
```

### Secure API Hook Pattern

```typescript
// Always use useSecureApi for backend communication with NEW object-based signature
const { securePost, secureGet, protectedPost, protectedGet } = useSecureApi();

// NEW SIGNATURE: All methods use object parameters (required since merge from develop)
// ✅ CORRECT - Object-based parameters
const response = await secureGet<User>({
  endpoint: SECURE_ENDPOINTS.USER.PROFILE,
  options: { timeout: 15000 }, // Optional
});

const response = await securePost({
  endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
  data: formData,
  options: { timeout: 30000 },
});

// ❌ WRONG - Old signature (deprecated)
const result = await callSecure('/auctions', 'POST', { data }); // Don't use this

// Headers automatically include:
// - Content-Type: application/json (or multipart/form-data for FormData)
// - x-api-key: (from env)
// - x-timestamp: (current timestamp)
// - Authorization: Bearer <JWT> (for secure methods only)
```

**Key Implementation Details** (`src/hooks/api/useSecureApi.ts`):

- **New signature**: Object parameters `{ endpoint, data?, options? }`
- Auto-refreshes Supabase session via `supabase.auth.getSession()`
- Throws `MISSING_JWT` error if session invalid
- Configurable timeout/retry via `RequestOptions`
- Dev logging enabled via `DEV_CONFIG.ENABLE_REQUEST_LOGGING`
- **Error format**: Returns `LangMap` object `{ es: string, en: string }` instead of plain string

**Common API Patterns**:

```typescript
// Pattern 1: GET with type safety
const { secureGet } = useSecureApi();
const response = await secureGet<User>({
  endpoint: SECURE_ENDPOINTS.USER.PROFILE,
});

if (response.error) {
  console.error('ERROR_LOAD_USER', response.error);
  // TODO: Show toast with response.error[locale]
  return;
}

if (response.data) {
  setUserData(response.data);
}

// Pattern 2: POST with data validation
const { securePost } = useSecureApi();
const response = await securePost({
  endpoint: SECURE_ENDPOINTS.USER.CREATE_ADDRESS,
  data: addressData,
});

if (response.error) {
  console.error('ERROR_CREATE_ADDRESS', response.error);
  // TODO: Show toast
  return;
}

// Pattern 3: POST with FormData (file upload)
const formData = new FormData();
formData.append('file', fileData);
formData.append('userId', userId);

const response = await securePost({
  endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
  data: formData,
  options: { timeout: 30000 }, // Longer timeout for uploads
});

// Pattern 4: Loading user data on mount with safety checks
useEffect(() => {
  const loadData = async () => {
    const response = await secureGet<DataType>({
      endpoint: SECURE_ENDPOINTS.SOME.ENDPOINT,
    });

    if (response.error) {
      console.error('ERROR_LOAD_DATA', response.error);
      // TODO: Show toast
      router.back(); // Navigate away if data is critical
      return;
    }

    if (!response.data) {
      console.error('ERROR_NO_DATA_RECEIVED');
      // TODO: Show toast
      router.back(); // Don't allow screen to render without data
      return;
    }

    setData(response.data);
  };

  loadData();
}, []);
```

**Error Handling Convention**:

- **NO Alert.alert** - Use console.error + TODO comment for future toast implementation
- **Pattern**: `console.error('ERROR_DESCRIPTION', error)` + `// TODO: Show toast`
- **Navigate back** on critical errors: `router.back()` after logging error
- **Error messages** are LangMap: `response.error[locale]` or `response.error.es/en`

```typescript
// ✅ CORRECT error handling
if (response.error) {
  console.error('ERROR_LOAD_USER_DATA', response.error);
  // TODO: Show toast with response.error[locale]
  router.back();
  return;
}

// ❌ WRONG - Don't use Alert
if (response.error) {
  Alert.alert('Error', response.error[locale]);
}
```

## Internationalization (i18n)

### Translation Pattern

```typescript
// Always use useTranslation hook with React 19 useTransition
const { t, changeLanguage, locale, isPending } = useTranslation();

// Translation keys follow nested structure in src/i18n/locales/
<Text>{t('screens.home.title')}</Text>
<Text>{t('tabsNames.auctions')}</Text>

// Language changes use React concurrent features for smooth UX
changeLanguage('en'); // Non-blocking with isPending state
```

**Default Language**: Spanish (`es`) with English (`en`) support.
**Device Detection**: Auto-detects device language via `expo-localization`.

**Translation File Structure** (`src/i18n/locales/es.json`, `en.json`):

```json
{
  "commonActions": { "loading": "...", "error": "..." },
  "loginPage": { "login": "...", "email": "..." },
  "tabsNames": { "home": "...", "auctions": "..." }
}
```

**Implementation**: `useTranslation` wraps `i18n-js` with React 19's `useTransition` to prevent UI blocking during language switches.

## UI Components & Styling

### NativeWind (Tailwind) Conventions

- Custom CSS variables in `global.css` for theme colors
- Tailwind classes work directly: `className="bg-primary text-lg"`
- Custom colors: `cinnabar`, `silver`, `melon`, `light-black`
- Typography scale defined in CSS custom properties (`--text-xs` to `--text-4xl`)

### Theming Pattern

```typescript
// Always use useColorScheme for theme-aware components
const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? 'light'];
```

## Database & Types

### Supabase Integration

- **Auto-generated types** in `src/types/supabase.ts` (1500+ lines)
- **Complex schema**: Articles, Auctions, Users, Bids, Payments, Live auctions
- **LargeSecureStore** for encryption of large session data
- **Real-time auth state** managed in `app/_layout.tsx` with `AuthContext`

### Key Database Entities

- `Article`: Auction items with detailed metadata
- `Auction`: Time-bound auction events
- `ArticleBid`: Real-time bidding system
- `LiveAuction`: Live streaming auction state
- `User`: Role-based user profiles

## Development Workflow

### Essential Commands

```bash
# Development
npm start              # Start Expo dev server
npm run test:watch     # Jest in watch mode
npm run lint:fix       # ESLint + Prettier

# Testing
npm run coverage:open  # Open coverage report
npm test              # Run full test suite

# Platform-specific
npm run android       # Start Android development
npm run ios          # Start iOS development
npm run web          # Start web development
```

### Testing Patterns

- **Jest + React Native Testing Library**
- **Snapshot testing** for components
- **80% coverage threshold** enforced
- Test files mirror `src/` structure in `__tests__/`

### Code Quality

- **ESLint** with Expo config + Prettier integration
- **TypeScript strict mode** enabled
- **Import path aliases** configured in `tsconfig.json`

## Key Hooks & Utilities

### Essential Custom Hooks

- `useAuth()`: Session and role management
- `useTranslation()`: i18n with React 19 transitions
- `useAuthNavigation()`: Protected route navigation
- `useSecureApi()`: Backend API communication (object-based signature)
- `useColorScheme()`: Theme-aware styling

### React Hook Form Patterns

**Pattern 1: Form with dynamic data loading**

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const {
  control,
  handleSubmit,
  formState: { errors },
  reset, // Use reset() to populate form with loaded data
} = useForm<FormType>({
  resolver: zodResolver(schema),
  defaultValues: {
    field1: '',
    field2: '',
  },
});

// Load data and populate form
useEffect(() => {
  const loadData = async () => {
    const response = await secureGet<DataType>({ endpoint: '...' });

    if (response.data) {
      // Use reset() to fill form with server data
      reset({
        field1: response.data.field1 || '',
        field2: response.data.field2 || '',
      });
    }
  };

  loadData();
}, [reset]);

// reset() does NOT clear the form - it SETS new default values
// The form stays populated and marks it as "pristine" (no changes)
```

**Pattern 2: Submit with navigation**

```typescript
const onSubmit = async (data: FormType) => {
  setLoading(true);

  try {
    const response = await securePost({
      endpoint: SECURE_ENDPOINTS.SOME.ENDPOINT,
      data,
    });

    if (response.error) {
      console.error('ERROR_SUBMIT', response.error);
      // TODO: Show toast
      return;
    }

    if (response.data) {
      // Success - navigate away (no need to reset form, we're leaving)
      router.back();
    }
  } catch (error) {
    console.error('ERROR_SUBMIT_CATCH', error);
    // TODO: Show toast
  } finally {
    setLoading(false);
  }
};

// Note: No need to reset() after successful submit if using router.back()
// The form will reload fresh data when user returns via useEffect
```

### Smart Navigation Components

- `CustomLink`: Auto-detects auth requirements from `routeConfig.ts`
- `ProtectedRoute`: Wraps entire app for auth enforcement
- Route protection configured declaratively in `src/components/navigation/routeConfig.ts`

### Error Handling

- **Sentry integration** with PII scrubbing in `app/_layout.tsx`
- **Custom error boundaries** via Expo Router
- **Graceful degradation** with ErrorLoading component

## Critical Patterns

### Auth State Management

```typescript
// AuthContext provides session & role globally in app/_layout.tsx
// ProtectedRoute component wraps entire app and handles redirects
// Route access controlled via PROTECTED_ROUTES in routeConfig.ts
const PROTECTED_ROUTES = {
  'my-auctions': { requiredRole: 'AUCTIONEER' }, // Specific role
  account: {}, // Any authenticated user
};
```

**Auth Flow Details** (`src/context/auth-context.tsx`):

1. Loads session from `LargeSecureStore` (encrypted AsyncStorage)
2. Validates session with Supabase server via `getUser()`
3. Fetches user role from database via `getUserRole()`
4. Schedules token refresh 30s before expiry
5. On error/expiry: auto-signs out and sets `unauthenticated` state

### Tab Visibility Logic

```typescript
// Tabs conditionally shown based on auth state in app/(tabs)/_layout.tsx
<Tabs.Screen
  href={session && role === 'AUCTIONEER' ? undefined : null}
/>
```

### Path Alias Convention

**CRITICAL**: Always use `@/` imports - direct relative paths break tests and bundler:

```typescript
// ✅ CORRECT
import { useAuth } from '@/context/auth-context';
import { Colors } from '@/constants/Colors';

// ❌ WRONG
import { useAuth } from '../../src/context/auth-context';
```

Configured in: `tsconfig.json`, `jest.config.js`, and Metro bundler.

## Development Notes

### Environment Configuration

- Environment variables prefixed with `EXPO_PUBLIC_`
- Supabase credentials in environment files
- API configuration supports local/production backends

### Platform Support

- **Universal app**: iOS, Android, Web
- **New Architecture** enabled (Expo SDK 53)
- **Edge-to-edge** Android support

When working on this codebase, always consider role-based access, use the established hook patterns, and maintain the file-based routing conventions.
