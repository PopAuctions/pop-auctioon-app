# PopAuction - React Native Auction App

Aplicación móvil de subastas construida con React Native, Expo y Supabase.

## 🚀 Inicio Rápido

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm start                # Iniciar Expo dev server
pnpm android             # Abrir en Android
pnpm ios                 # Abrir en iOS
pnpm web                 # Abrir en web
```

### Testing

```bash
pnpm test                # Ejecutar tests
pnpm test:watch          # Tests en modo watch
pnpm coverage:open       # Ver reporte de cobertura
```

### Development Builds

```bash
pnpm build:ios             # Build para iOS Simulator (cloud - GRATIS)
pnpm build:android         # Build para Android Emulator/Device (cloud - GRATIS)
pnpm build:ios:device      # Build para iPhone/iPad (cloud - requiere Apple Developer $99/año)
```

📖 Ver [BUILD.md](./BUILD.md) para guía detallada de builds.

## 🏗️ Tech Stack

- **Framework**: Expo SDK 53 con New Architecture
- **React**: 19.0.0 con concurrent features
- **Routing**: Expo Router v5.1+ (file-based)
- **Styling**: NativeWind v4.1+ (Tailwind CSS)
- **Backend**: Supabase (Auth + Database)
- **i18n**: i18n-js v4.5+ (ES/EN)
- **State**: React Context + Hooks
- **Testing**: Jest + React Native Testing Library
- **Error Tracking**: Sentry

## 📁 Estructura del Proyecto

```
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── auth/          # Authentication screens
│   │   ├── home/          # Dashboard
│   │   ├── auctions/      # Auction browsing
│   │   ├── my-auctions/   # Auctioneer section
│   │   ├── store/         # Product store
│   │   └── account/       # User settings
│   └── _layout.tsx        # Root layout with providers
├── src/
│   ├── components/        # Shared components
│   ├── hooks/             # Custom hooks
│   ├── context/           # React contexts
│   ├── utils/             # Utilities
│   ├── types/             # TypeScript types
│   ├── constants/         # App constants
│   ├── config/            # Configuration
│   └── i18n/              # Translations (ES/EN)
├── __tests__/             # Test files (mirror src/)
├── assets/                # Images, fonts, lottie
└── coverage/              # Coverage reports
```

## 🔐 Autenticación

Sistema de autenticación basado en roles con Supabase:

- **USER**: Acceso básico (subastas, tienda, cuenta)
- **AUCTIONEER**: Puede crear/gestionar subastas + permisos USER

### Protección de Rutas

```typescript
// Configuración declarativa en routeConfig.ts
PROTECTED_ROUTES = {
  'my-auctions': { requiresAuth: true, requiresRole: 'AUCTIONEER' }
}

// Navegación con verificación automática
const { navigateWithAuth } = useAuthNavigation();
navigateWithAuth('/(tabs)/my-auctions');

// CustomLink auto-detecta requisitos de auth
<CustomLink href="/(tabs)/my-auctions" mode="primary">
  Mis Subastas
</CustomLink>
```

## 🌐 Internacionalización

```typescript
const { t, changeLanguage, locale } = useTranslation();

<Text>{t('screens.home.title')}</Text>
<Text>{t('tabsNames.auctions')}</Text>

changeLanguage('en'); // Cambio no bloqueante con React 19
```

**Idiomas**: Español (predeterminado), Inglés

## 🎨 Estilos

### NativeWind (Tailwind CSS)

```typescript
<View className="bg-primary p-4 rounded-lg">
  <Text className="text-lg font-bold text-white">
    Hola Mundo
  </Text>
</View>
```

### Colores Personalizados

- `cinnabar` - Primario
- `silver` - Secundario
- `melon` - Acentos
- `light-black` - Texto

## 🔌 API Communication

### Protected Endpoints (API Key)

```typescript
const { callProtected } = useSecureApi();
const result = await callProtected('/email/send', 'POST', data);
```

### Secure Endpoints (JWT + API Key)

```typescript
const { callSecure } = useSecureApi();
const result = await callSecure('/auctions', 'POST', data);
// Headers automáticos: Authorization, x-api-key, x-timestamp
```

## 🧪 Testing

### Ejecutar Tests

```bash
pnpm test                      # Ejecutar todos los tests
pnpm test:watch                # Modo watch
pnpm test:update-snapshots     # Actualizar snapshots
pnpm coverage:open             # Ver cobertura
```

### Cobertura Actual

- **Total**: 359 tests pasando
- **Snapshots**: 102 pasando
- **Cobertura**: 84%+

### Archivos con Alta Cobertura

- `getProxiedImageUrl.ts`: **100%** ✅
- `calendar.ts`: **94.74%** ✅
- `useSecureApi.ts`: **68.91%**
- `CustomLink.tsx`: **61.11%**

## 📱 Navegación

### Estructura de Tabs

- `/auth` - Login/Registro
- `/home` - Dashboard/API Testing
- `/auctions` - Calendario de subastas
- `/my-auctions` - Gestión (AUCTIONEER only)
- `/store` - Tienda de productos
- `/account` - Perfil y configuración

### Rutas Dinámicas

```typescript
// app/store/[id].tsx
const { id } = useLocalSearchParams();
```

## 🔒 Seguridad

- **LargeSecureStore**: Encriptación AES-256 para sesiones grandes
- **Auto-refresh**: Tokens actualizados 30s antes de expirar
- **Role-based access**: Control granular de permisos
- **Sentry PII scrubbing**: Datos sensibles protegidos

## 🛠️ Scripts Útiles

```bash
# Desarrollo
pnpm start                 # Dev server
pnpm android               # Android development
pnpm ios                   # iOS development

# Calidad de Código
pnpm lint                  # ESLint check
pnpm lint:fix              # ESLint fix
pnpm prettier:check        # Prettier check
pnpm prettier:fix          # Prettier fix

# Testing
pnpm test                  # Run tests
pnpm test:watch            # Watch mode
pnpm coverage:open         # Coverage report

# Builds
pnpm build:dev:ios         # iOS Simulator build
pnpm build:dev:android     # Android Emulator build
```

## 📚 Documentación Adicional

- [BUILD.md](./BUILD.md) - Guía completa de builds
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Arquitectura y patrones
- [app/\_layout.tsx](./app/_layout.tsx) - Configuración de providers

## 🤝 Contribución

1. Crear branch desde `main`: `git checkout -b feature/nombre`
2. Hacer cambios y tests
3. Verificar calidad: `pnpm lint:fix && pnpm test`
4. Commit y push
5. Crear Pull Request

## 📋 Requisitos

- Node.js 22.19.0 (gestionado por Volta)
- npm 11.6.0
- Expo CLI
- Para iOS: macOS con Xcode
- Para Android: Android Studio

## 🐛 Solución de Problemas

### Tests Fallando

```bash
npm run test:update-snapshots  # Si snapshots desactualizados
```

### Build Errors

```bash
npm install          # Reinstalar dependencias
npx expo start -c   # Limpiar cache
```

### Supabase Errors

Verificar variables de entorno en `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📄 Licencia

[Agregar licencia]

## 👥 Equipo

PopAuctions Team

---

**Versión**: 1.0.0
**Última actualización**: Octubre 2025
