# PopAuction React Native App - AI Copilot Instructions

## Architecture Overview

This is a **React Native/Expo** auction application with **file-based routing** using `expo-router`. The app features role-based authentication via **Supabase** with secure API communication to a Next.js backend.

### Key Tech Stack

- **Expo SDK 54.0.30** (React Native 0.81.5) with New Architecture enabled
- **React 19.2.3** with concurrent features (`useTransition` in i18n)
- **Expo Router v6.0.21** (file-based routing with typed routes, native tabs support)
- **Supabase** (auth & database with complex schema in `src/types/supabase.ts`)
- **NativeWind v4.2.1** (Tailwind CSS for React Native)
- **i18n-js v4.5+** (Spanish/English localization)
- **Sentry ~7.2.0** (error tracking with PII scrubbing in `app/_layout.tsx`)
- **TypeScript 5.9.3** with strict configuration
- **Volta** (Node 22.19.0 pinning)
- **pnpm 10.26.0** (package manager - NOT npm)
- **react-native-reanimated v4.2.1** (New Architecture only, includes worklets)
- **react-native-worklets v0.7.1** (required by Reanimated v4)
- **Stripe 0.50.3** (payment processing via `@stripe/stripe-react-native`)
- **React Native Gesture Handler ~2.28.0** (gesture support in GestureHandlerRootView)

### Project Structure Pattern

- `app/` - File-based routing (Expo Router v6.0.21)
- `src/` - Business logic, components, hooks, utilities
- **Path aliases**: Extensive mapping in `tsconfig.json` and `jest.config.js` - always use `@/` imports

### SDK 54 Specific Changes

**New Features:**

- **iOS**: Precompiled React Native frameworks (10x faster builds)
- **Android**: Edge-to-edge ALWAYS enabled (cannot be disabled)
- **Expo Router v6**: Native tabs support, link previews, improved modals
- **Reanimated v4**: Requires New Architecture, uses worklets

**Breaking Changes:**

1. **Edge-to-Edge Android**: Always enabled, use `androidNavigationBar.enforceContrast` in app.json
2. **Reanimated v3 → v4**: New Architecture only, requires `react-native-worklets@^0.7.0`
3. **expo-file-system**: New API is default, legacy available at `expo-file-system/legacy`
4. **Unhandled Promises**: Now logged as errors (add try-catch to all async code)

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

### Complete API Endpoint Reference

**Base URL Structure**: `${BASE_URL}/mobile/${SECURITY_LEVEL}${ENDPOINT}`

#### Protected Endpoints (API Key Only)

| Category          | Endpoint                                       | Purpose                   |
| ----------------- | ---------------------------------------------- | ------------------------- |
| **Email**         | `PROTECTED_ENDPOINTS.EMAIL.SEND`               | Send transactional emails |
|                   | `PROTECTED_ENDPOINTS.EMAIL.VERIFY`             | Verify email addresses    |
|                   | `PROTECTED_ENDPOINTS.EMAIL.TEMPLATE`           | Get email templates       |
| **Notifications** | `PROTECTED_ENDPOINTS.NOTIFICATIONS.SEND`       | Send push notifications   |
|                   | `PROTECTED_ENDPOINTS.NOTIFICATIONS.REGISTER`   | Register device token     |
|                   | `PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER` | Unregister device         |
| **Tokens**        | `PROTECTED_ENDPOINTS.TOKENS.REFRESH`           | Refresh auth tokens       |
|                   | `PROTECTED_ENDPOINTS.TOKENS.VALIDATE`          | Validate token status     |
|                   | `PROTECTED_ENDPOINTS.TOKENS.REVOKE`            | Revoke tokens             |
| **Analytics**     | `PROTECTED_ENDPOINTS.ANALYTICS.EVENT`          | Track analytics events    |
|                   | `PROTECTED_ENDPOINTS.ANALYTICS.CRASH`          | Report crashes            |
|                   | `PROTECTED_ENDPOINTS.ANALYTICS.PERFORMANCE`    | Performance metrics       |

#### Secure Endpoints (JWT + API Key)

| Category            | Endpoint                                   | Purpose                                 |
| ------------------- | ------------------------------------------ | --------------------------------------- |
| **User Management** | `SECURE_ENDPOINTS.USER.CURRENT_USER`       | Get current user profile                |
|                     | `SECURE_ENDPOINTS.USER.EDIT_INFO`          | Update user profile (supports FormData) |
|                     | `SECURE_ENDPOINTS.USER.PREFERENCES`        | User preferences                        |
|                     | `SECURE_ENDPOINTS.USER.HISTORY`            | User activity history                   |
|                     | `SECURE_ENDPOINTS.USER.FAVORITES`          | Manage favorites                        |
|                     | `SECURE_ENDPOINTS.USER.ADDRESSES`          | List user addresses                     |
|                     | `SECURE_ENDPOINTS.USER.CREATE_ADDRESS`     | Create new address                      |
| **Auctions**        | `SECURE_ENDPOINTS.AUCTIONS.LIST`           | List all auctions                       |
|                     | `SECURE_ENDPOINTS.AUCTIONS.CREATE`         | Create new auction (AUCTIONEER)         |
|                     | `SECURE_ENDPOINTS.AUCTIONS.UPDATE`         | Update auction (AUCTIONEER)             |
|                     | `SECURE_ENDPOINTS.AUCTIONS.DELETE`         | Delete auction (AUCTIONEER)             |
|                     | `SECURE_ENDPOINTS.AUCTIONS.JOIN`           | Join auction                            |
|                     | `SECURE_ENDPOINTS.AUCTIONS.BID`            | Place bid                               |
|                     | `SECURE_ENDPOINTS.AUCTIONS.DETAILS`        | Get auction details                     |
| **Config**          | `SECURE_ENDPOINTS.CONFIG.VARIABLES`        | Environment variables                   |
|                     | `SECURE_ENDPOINTS.CONFIG.APP_SETTINGS`     | App settings                            |
|                     | `SECURE_ENDPOINTS.CONFIG.FEATURE_FLAGS`    | Feature flags                           |
| **Actions**         | `SECURE_ENDPOINTS.ACTIONS.CREATE_AUCTION`  | Server action: create auction           |
|                     | `SECURE_ENDPOINTS.ACTIONS.UPDATE_AUCTION`  | Server action: update auction           |
|                     | `SECURE_ENDPOINTS.ACTIONS.PROCESS_PAYMENT` | Server action: process payment          |
|                     | `SECURE_ENDPOINTS.ACTIONS.SEND_MESSAGE`    | Server action: send message             |

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
- **Toast system**: Available via `useToast()` hook from `@/hooks/useToast` (see Toast Messages section)

```typescript
// ✅ CORRECT error handling with toast (preferred)
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';

const { locale } = useTranslation();
const { callToast } = useToast(locale);

if (response.error) {
  console.error('ERROR_LOAD_USER_DATA', response.error);
  callToast({
    variant: 'error',
    description: response.error, // LangMap: { es: string, en: string }
  });
  router.back();
  return;
}

// ✅ ACCEPTABLE - console.error with TODO (if toast not yet implemented in that screen)
if (response.error) {
  console.error('ERROR_LOAD_USER_DATA', response.error);
  // TODO: Show toast with response.error
  router.back();
  return;
}

// ❌ WRONG - Don't use Alert
if (response.error) {
  Alert.alert('Error', response.error[locale]);
}
```

### Backend Integration Patterns

#### Pattern 1: Simple GET Request (Load User Profile)

```typescript
// app/(tabs)/account/edit-profile.tsx
import { SECURE_ENDPOINTS } from '@/config/api-config';

const loadUserData = async () => {
  const response = await secureGet<User>({
    endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
  });

  if (response.error) {
    console.error('ERROR_LOAD_USER_DATA', response.error);
    // TODO: Show toast
    router.back();
    return;
  }

  if (!response.data) {
    console.error('ERROR_NO_USER_DATA_RECEIVED');
    // TODO: Show toast
    router.back();
    return;
  }

  setCurrentUserData(response.data);
  reset(response.data); // Populate form
};
```

#### Pattern 2: POST with JSON Payload (Update Profile - No Image)

```typescript
// Send JSON data (no file upload)
const payload = {
  username: data.username,
  name: data.name,
  lastName: data.lastName,
  phoneNumber: data.phoneNumber || '',
  oldProfilePicture: currentUserData?.profilePicture || '',
  oldPhoneNumber: currentUserData?.phoneNumber || '',
  // Conditional fields based on user role
  ...('storeName' in data && {
    storeName: data.storeName || '',
    webPage: data.webPage || '',
    socialMedia: data.socialMedia || '',
    address: data.address || '',
    town: data.town || '',
    province: data.province || '',
    country: data.country || '',
    postalCode: data.postalCode || '',
  }),
};

const response = await securePost({
  endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
  data: payload,
});

if (response.error) {
  console.error('ERROR_UPDATE_PROFILE', response.error);
  // TODO: Show toast
  return;
}

if (response.data) {
  // TODO: Show success toast
  router.back();
}
```

#### Pattern 3: POST with FormData (Update Profile - With Image)

```typescript
// When uploading files, use FormData
const formData = new FormData();

// Add text fields
formData.append('username', data.username);
formData.append('name', data.name);
formData.append('lastName', data.lastName);
formData.append('phoneNumber', data.phoneNumber || '');
formData.append('oldProfilePicture', currentUserData?.profilePicture || '');
formData.append('oldPhoneNumber', currentUserData?.phoneNumber || '');

// Add conditional fields (AUCTIONEER-specific)
if ('storeName' in data) {
  formData.append('storeName', data.storeName || '');
  formData.append('webPage', data.webPage || '');
  formData.append('socialMedia', data.socialMedia || '');
  formData.append('address', data.address || '');
  formData.append('town', data.town || '');
  formData.append('province', data.province || '');
  formData.append('country', data.country || '');
  formData.append('postalCode', data.postalCode || '');
}

// Add image file (from ImageUploadButton)
if (data.profilePicture) {
  const uriParts = data.profilePicture.split('.');
  const fileType = uriParts[uriParts.length - 1];

  formData.append('profilePicture', {
    uri: data.profilePicture,
    name: `profile.${fileType}`,
    type: `image/${fileType}`,
  } as any);
}

// Send with extended timeout for file upload
const response = await securePost({
  endpoint: SECURE_ENDPOINTS.USER.EDIT_INFO,
  data: formData,
  options: {
    timeout: 30000, // 30 seconds for file upload
  },
});

// useSecureApi automatically detects FormData and:
// - Removes Content-Type header (let fetch set multipart/form-data)
// - Skips JSON.stringify on body
```

#### Pattern 4: GET Request with Array Response (Load Addresses)

```typescript
// app/(tabs)/account/addresses.tsx
const loadAddresses = async () => {
  const response = await secureGet<UserAddress[]>({
    endpoint: SECURE_ENDPOINTS.USER.ADDRESSES,
  });

  if (response.error) {
    console.error('ERROR_LOAD_ADDRESSES', response.error);
    // TODO: Show toast
    return;
  }

  if (response.data && Array.isArray(response.data)) {
    setAddresses(response.data);
  }
};
```

#### Pattern 5: Conditional JSON vs FormData (Optimize Bandwidth)

```typescript
// Smart pattern: only use FormData if uploading files
const hasImage = data.profilePicture && data.profilePicture !== '';

if (hasImage) {
  // Use FormData (Pattern 3)
  const formData = new FormData();
  // ... add fields and file
  await securePost({ endpoint, data: formData, options: { timeout: 30000 } });
} else {
  // Use JSON (Pattern 2) - faster, smaller payload
  const payload = { ...data };
  await securePost({ endpoint, data: payload });
}
```

#### Pattern 6: Protected Endpoint (No JWT Required)

```typescript
// For public operations like sending emails, notifications
const { protectedPost } = useSecureApi();

const sendEmail = async () => {
  const response = await protectedPost({
    endpoint: PROTECTED_ENDPOINTS.EMAIL.SEND,
    data: {
      to: 'user@example.com',
      subject: 'Welcome',
      template: 'welcome',
    },
  });

  // Same error handling as secure endpoints
  if (response.error) {
    console.error('ERROR_SEND_EMAIL', response.error);
    // TODO: Show toast
  }
};
```

#### Pattern 7: GET with Secure Header (Special Case)

```typescript
// Rarely used: protected endpoint that needs JWT
const { protectedGet } = useSecureApi();

const response = await protectedGet({
  endpoint: PROTECTED_ENDPOINTS.SOME.ENDPOINT,
  secureHeader: true, // Adds JWT to protected endpoint
});
```

### API Configuration Constants

**Timeouts** (from `api-config.ts`):

- Default: 10 seconds
- Email/Notifications: 3-5 seconds
- Auction creation: 15 seconds
- File upload: 30 seconds

**Retry Strategy**:

- Max retries: 2
- Base delay: 1 second
- Exponential backoff with 10-second cap

**Rate Limits**:

- Protected endpoints: 100 req/min
- Secure endpoints: 200 req/min

**File Upload Limits**:

- Max file size: 5MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- Max request size: 10MB

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

## React Context Architecture

### AuthContext (`src/context/auth-context.tsx`)

Central authentication state management used throughout the app:

```typescript
const { auth, getSession } = useAuth();
const [session, role] = getSession();

// Auth state is typed union
type AuthState =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; session: Session; role: UserRoles | null };
```

### HighestBidderContext (`src/context/highest-bidder-context.tsx`)

Real-time bidding state for auction screens:

```typescript
const { state, setState } = useHighestBidderContext({
  initialValue: {
    highestBidder: 'username',
    highestBidderImage: 'url',
    currentValue: 1000,
    available: true,
  },
});

// Update state (partial updates supported)
setState({ currentValue: 1200 });
```

**Pattern**: Both contexts are provided in `app/_layout.tsx` and use optimized memoization to prevent unnecessary re-renders.

## Development Workflow

### Package Manager

**CRITICAL**: This project uses **pnpm**, not npm. All commands must use `pnpm`:

```bash
# ✅ CORRECT
pnpm install
pnpm start
pnpm test

# ❌ WRONG - Don't use npm
npm install
npm start
```

The project is configured with `"packageManager": "pnpm@10.26.0"` in package.json and uses a pnpm workspace configuration.

### Essential Commands

```bash
# Development
pnpm start              # Start Expo dev server
pnpm dev                # Alias for start
pnpm test:watch         # Jest in watch mode
pnpm lint:fix           # ESLint + Prettier
pnpm prettier:fix       # Format all files

# Testing
pnpm coverage:open      # Open coverage report in browser
pnpm test               # Run full test suite
pnpm test:update-snapshots  # Update Jest snapshots

# Quality Checks
pnpm check-all          # Run type-check, lint, format, and tests
pnpm type-check         # TypeScript validation

# Platform-specific
pnpm android            # Start Android development
pnpm ios                # Start iOS development
pnpm web                # Start web development

# Build & Deploy
pnpm build:ios          # iOS Simulator build (cloud - free)
pnpm build:android      # Android build (cloud - free)
pnpm build:ios:device   # iOS device build (requires Apple Developer $99/year)

# Database Types
pnpm generate-types     # Regenerate Supabase types from schema
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

## Form Validation with Zod

### Bilingual Error Messages Pattern

All validation schemas use **JSON.stringify** for bilingual error messages:

```typescript
import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: JSON.stringify({
      en: 'Email required',
      es: 'Email requerido',
    }),
  }),
  password: z.string().min(8, {
    message: JSON.stringify({
      en: 'Min. 8 characters',
      es: 'Mín. 8 caracteres',
    }),
  }),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
```

**Displaying errors in forms**:

```typescript
const { locale } = useTranslation();
const { formState: { errors } } = useForm();

// Parse JSON error message and select locale
{errors.email && (
  <CustomText type="error">
    {JSON.parse(errors.email.message || '{}')[locale] || errors.email.message}
  </CustomText>
)}
```

**Common validation schemas** in `src/utils/schemas/`:

- `LoginSchema`, `UserRegisterSchema`, `AuctioneerRegisterSchema`
- `EditProfileSchema`, `AddressSchema`
- `NewAuctionSchema`, `EditAuctionSchema`
- Use constants: `MIN_USER_PASSWORD_LENGTH`, `MIN_USERNAME_LENGTH`, `MAX_USERNAME_LENGTH`

## Key Hooks & Utilities

### Essential Custom Hooks

- `useAuth()`: Session and role management
- `useTranslation()`: i18n with React 19 transitions
- `useAuthNavigation()`: Protected route navigation
- `useSecureApi()`: Backend API communication (object-based signature)
- `useColorScheme()`: Theme-aware styling
- `useHighestBidderContext()`: Real-time bidding state management

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

### Image Components

**CustomImage** (`src/components/ui/CustomImage.tsx`):

- Auto-proxies Supabase image URLs through backend
- Uses `getProxiedImageUrl()` utility to transform paths
- Example: Supabase URL → `${EXPO_PUBLIC_BASE_URL}/images/filename`

```typescript
<CustomImage
  src="https://supabase.co/storage/.../image.jpg"
  alt="Description"
  className="w-24 h-24 rounded-lg"
  resizeMode="cover"
  plainUrl={false} // Set true to skip proxy
/>
```

**ImageUploadButton** (`src/components/ui/ImageUploadButton.tsx`):

- Two modes: **simple** (single image) and **multiple** (array of images)
- Always used with React Hook Form + Controller + Zod
- Auto-handles permissions, preview, validation, size warnings
- See `ImageUploadButton.README.md` for complete usage guide

```typescript
// Simple mode (profile picture)
<Controller
  control={control}
  name="profilePicture"
  render={({ field: { onChange, value } }) => (
    <ImageUploadButton
      selectedImage={value || null}
      onImageSelected={onChange}
      onImageRemoved={() => onChange('')}
    />
  )}
/>

// Multiple mode (article gallery)
<Controller
  control={control}
  name="images"
  render={({ field: { onChange, value } }) => (
    <ImageUploadButton
      multiple={true}
      maxImages={10}
      selectedImages={value || []}
      onImagesSelected={onChange}
      onImageRemovedAt={(index) => {
        onChange((value || []).filter((_, i) => i !== index));
      }}
    />
  )}
/>
```

### Error Handling

- **Sentry integration** with PII scrubbing in `app/_layout.tsx`
- **Custom error boundaries** via Expo Router
- **Graceful degradation** with ErrorLoading component

## Toast Messages

The app uses `react-native-toast-message` for user notifications. Access via `useToast()` hook:

```typescript
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';

const { locale } = useTranslation();
const { callToast } = useToast(locale);

// Success message
callToast({
  variant: 'success',
  description: 'Profile updated successfully',
});

// Error message (with bilingual support using LangMap)
callToast({
  variant: 'error',
  description: response.error, // LangMap from API: { es: string, en: string }
});

// Info/Warning with action button
callToast({
  variant: 'info',
  description: 'New auction available',
  actionLabel: 'View',
  onAction: () => router.push('/auctions'),
});
```

**Toast Variants**: `success`, `error`, `info`, `warning`

**Options**:

- `description`: LangMap object, translation key string, or plain string
- `position`: `'top'` (default) or `'bottom'`
- `durationMs`: Custom display duration
- `haptics`: Enable/disable haptic feedback (default: true)
- `actionLabel` / `onAction`: Add action button to toast

**Provider**: `ToastProvider` wraps app in `app/_layout.tsx` - no manual setup needed in screens.

## Payment Integration

### Stripe Setup

The app uses `@stripe/stripe-react-native` for payment processing:

```typescript
// StripeProvider wraps app in app/_layout.tsx
// Publishable key auto-loaded from EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Example: Payment sheet usage (see Stripe docs for details)
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();
```

**Configuration**: Stripe is initialized in `src/providers/StripeProvider.tsx` with automatic key loading from environment variables.

## Deep Linking

The app supports deep linking via `DeepLinkListener` component:

- **Component**: `src/components/navigation/DeepLinkListener.tsx`
- **Integration**: Auto-initialized in `app/_layout.tsx`
- **Handles**: OAuth callbacks, password resets, magic links, custom app links

Deep link handling is automatic - no manual setup needed in screens. Supabase auth deep links are processed in the listener component.

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
