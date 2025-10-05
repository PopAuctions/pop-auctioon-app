# PopAuction React Native App - AI Copilot Instructions

## Architecture Overview

This is a **React Native/Expo** auction application with **file-based routing** using `expo-router`. The app features role-based authentication via **Supabase** with secure API communication to a Next.js backend.

### Key Tech Stack

- **Expo SDK 53** with New Architecture enabled
- **React 19** with concurrent features (useTransition in i18n)
- **Expo Router v5.1+** (file-based routing with typed routes)
- **Supabase** (auth & database with complex schema in `src/types/supabase.ts`)
- **NativeWind v4.1+** (Tailwind CSS for React Native)
- **i18n-js v4.5+** (Spanish/English localization)
- **Sentry** (error tracking with PII scrubbing)
- **TypeScript** with strict configuration
- **Volta** (Node 22.19.0, npm 11.6.0 pinning)

### Project Structure Pattern

- `app/` - File-based routing (Expo Router v5.1+)
- `src/` - Business logic, components, hooks, utilities
- Path aliases: Extensive mapping in `tsconfig.json` and `jest.config.js`

## Authentication & Authorization

### Core Pattern: Role-Based Access Control

```typescript
// Always use AuthContext for session/role checking
const { session, role } = useAuth();

// Route protection via ProtectedRoute component
// Configuration in src/components/navigation/routeConfig.ts
```

**User Roles:**

- `USER`: Basic access (auctions, store, account)
- `AUCTIONEER`: Can create/manage auctions + all USER permissions

### Navigation with Auth

```typescript
// Use useAuthNavigation for protected navigation
const { navigateWithAuth } = useAuthNavigation();
navigateWithAuth('/(tabs)/my-auctions'); // Auto-handles auth checking
```

## Routing Architecture

### File-Based Routing Structure

```
app/(tabs)/           # Tab-based navigation
├── index.tsx         # Auth-based redirect logic
├── _layout.tsx       # Main tab configuration
├── auth/            # Auth flow (login, etc.)
├── home/            # Dashboard/API testing
├── auctions/        # Auction browsing/calendar
├── my-auctions/     # AUCTIONEER-only section
├── store/           # Product store
└── account/         # User profile/settings
```

**Layout Pattern**: Each section has `_layout.tsx` with Stack navigation for sub-routes.

### Dynamic Routes

- `[id].tsx` for parameterized routes (e.g., `store/[id].tsx`)
- Use `useLocalSearchParams()` from expo-router for accessing parameters

## API Communication

### Dual Security Levels

Configuration in `src/config/api-config.ts`:

```typescript
// Protected endpoints (API key only)
PROTECTED_ENDPOINTS.EMAIL.SEND;

// Secure endpoints (JWT + API key)
SECURE_ENDPOINTS.AUCTIONS.CREATE;
```

### Secure API Hook Pattern

```typescript
// Always use useSecureApi for backend communication
const { callSecure, callProtected } = useSecureApi();

// Automatic JWT header management + retry logic
const result = await callSecure('/auctions', 'POST', { data });
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
- `useSecureApi()`: Backend API communication
- `useColorScheme()`: Theme-aware styling

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
  'my-auctions': { requiresAuth: true, requiresRole: 'AUCTIONEER' },
};
```

### Tab Visibility Logic

```typescript
// Tabs conditionally shown based on auth state in app/(tabs)/_layout.tsx
<Tabs.Screen
  href={session && role === 'AUCTIONEER' ? undefined : null}
/>
```

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
