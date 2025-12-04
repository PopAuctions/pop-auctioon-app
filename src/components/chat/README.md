# Chat en Vivo - AWS IVS Chat Integration

Sistema de chat en tiempo real para subastas en vivo utilizando AWS IVS Chat Messaging SDK.

## 📋 Arquitectura

Este chat está construido siguiendo los patrones de tu app PopAuction:

- **NativeWind (Tailwind CSS)** para estilos
- **Componentes custom**: `CustomText`, `CustomImage`, `Input`, `Button`
- **i18n** con hook `useTranslation` para español/inglés
- **Hooks personalizados** para lógica de negocio
- **Supabase Auth** para usuarios

## 📁 Componentes Creados

### Hooks (`src/hooks/chat/`)

- **`useChatRoom.ts`**
  - Conexión al ChatRoom de AWS IVS
  - Obtiene token automáticamente desde `/api/mobile/protected/chat/get-token`
  - Gestiona eventos: `connecting`, `connected`, `disconnected`, `message`, `messageDelete`
  - Auto-cleanup de listeners

- **`useSendMessage.ts`**
  - Envía mensajes con `SendMessageRequest`
  - Incluye atributo `profilePicture` en mensajes
  - Manejo de errores de envío

### Componentes (`src/components/chat/`)

- **`Chat.tsx`** - Componente principal
  - Integra todo el sistema
  - Header con indicador de conexión
  - FlatList con mensajes (auto-scroll)
  - Input condicional (oculto para anónimos)
  - Estados de carga y error

- **`ChatMessage.tsx`** - Mensaje individual
  - Avatar con CustomImage
  - Diferencia mensajes propios (azul) vs ajenos (gris)
  - Username solo en mensajes ajenos

- **`ChatInput.tsx`** - Input de envío
  - Usa componente `Input` custom
  - Botón `Button` con loading state
  - Validación de longitud máxima
  - Placeholder dinámico (conectado/desconectado)

## 🚀 Uso Básico

```tsx
import { Chat } from '@/components/chat/Chat';

// En tu pantalla de subasta en vivo
<View className='h-96'>
  <Chat
    auctionId={String(auctionId)}
    enabled={true}
    maxLength={500}
  />
</View>;
```

### Props del Componente Chat

```typescript
interface ChatProps {
  auctionId: string; // ID de la subasta (requerido)
  enabled?: boolean; // Habilitar/deshabilitar (default: true)
  maxLength?: number; // Longitud máxima mensaje (default: 500)
}
```

### Uso Avanzado con Hooks

Si necesitas control personalizado:

```tsx
import { useChatRoom } from '@/hooks/chat/useChatRoom';
import { useSendMessage } from '@/hooks/chat/useSendMessage';

function CustomChat({ auctionId }: { auctionId: string }) {
  const { room, messages, connectionState, isConnected } = useChatRoom({
    auctionId,
    enabled: true,
  });

  const { sendMessage, isSending } = useSendMessage({
    room,
    isConnected,
    profilePicture: 'https://...',
  });

  const handleSend = async (text: string) => {
    const success = await sendMessage(text);
    if (success) {
      console.log('Mensaje enviado');
    }
  };

  return (
    <View>
      <Text>Estado: {connectionState}</Text>
      <Text>Mensajes: {messages.length}</Text>
      {/* Tu UI personalizada */}
    </View>
  );
}
```

## 🎨 Estilos y Personalización

Todos los estilos usan **NativeWind (Tailwind CSS)**:

```tsx
// Colores principales
- Header: bg-cinnabar (rojo PopAuction)
- Mensajes propios: bg-blue-500
- Mensajes ajenos: bg-gray-200
- Texto: text-white, text-gray-900, text-gray-600

// Componentes custom
- CustomText: tipos h1-h4, body, bodysmall, error
- CustomImage: proxy automático de URLs Supabase
- Input: componente con border, focus:border-cinnabar
- Button: modes primary/secondary/empty, isLoading
```

Para cambiar colores, edita directamente las clases de Tailwind:

```tsx
// En Chat.tsx
<View className="bg-cinnabar px-4 py-3"> {/* Cambiar bg-cinnabar */}

// En ChatMessage.tsx
<View className={cn(
  'max-w-[70%] rounded-xl p-2',
  isMine ? 'bg-blue-500' : 'bg-gray-200' {/* Cambiar colores aquí */}
)}>
```

## 🌐 Traducciones (i18n)

Las traducciones están en `src/i18n/locales/`:

**es.json:**

```json
{
  "chat": {
    "title": "Chat en vivo",
    "placeholder": "Escribe un mensaje...",
    "connecting": "Conectando al chat...",
    "disconnected": "Desconectado...",
    "errorRetry": "Intenta recargar la pantalla",
    "noMessages": "Aún no hay mensajes",
    "loginToChat": "Inicia sesión para participar en el chat",
    "sendError": "No se pudo enviar el mensaje",
    "connectionError": "Error al conectar con el chat",
    "send": "Enviar"
  }
}
```

**en.json:** (traducción al inglés)

Asegúrate de tener configurado en `.env`:

```env
EXPO_PUBLIC_AWS_REGION=eu-central-1
EXPO_PUBLIC_API_BASE_URL=https://www.popauctioon.com
EXPO_PUBLIC_API_KEY=tu_api_key
```

### 2. Endpoint en api-config.ts

Ya está configurado en `PROTECTED_ENDPOINTS.CHAT.GET_TOKEN`:

```typescript
CHAT: {
  GET_TOKEN: '/chat/get-token',
}
```

### 3. Backend Endpoint

El endpoint ya existe en tu Next.js backend:

**Ruta:** `src/app/api/mobile/protected/chat/get-token/route.ts`

**Request:**

```json
{
  "auctionId": "123"
}
```

**Response:**

```json
{
  "error": null,
  "data": {
    "chatToken": "eyJhbGc...",
    "chatARN": "arn:aws:ivs:..."
  }
}
```

## 🎨 Personalización

### Estilos

Los estilos están en StyleSheet dentro de cada componente. Para personalizarlos, edita directamente los estilos:

```tsx
// En ChatMessage.tsx
const styles = StyleSheet.create({
  messageContent: {
    backgroundColor: '#E5E7EB', // Mensajes de otros
    // ...
  },
  messageContentMine: {
    backgroundColor: '#3B82F6', // Tus mensajes
    // ...
  },
});
```

### Colores del Header

En `Chat.tsx`:

```tsx
<View style={styles.header}>
  {/* backgroundColor: '#DC2626' (rojo cinnabar) */}
</View>
```

## 🔍 Características

### ✅ Implementadas

- ✅ Conexión automática al chat room
- ✅ Obtención de token desde backend
- ✅ Envío de mensajes con atributos
- ✅ Recepción en tiempo real
- ✅ Diferenciación de mensajes propios/ajenos
- ✅ Estados de conexión (connecting, connected, disconnected)
- ✅ Manejo de errores
- ✅ Auto-scroll al recibir mensajes
- ✅ Ocultar input para usuarios anónimos
- ✅ Cleanup automático de listeners
- ✅ Avatar en mensajes

### 🚧 Pendientes (Opcionales)

- [ ] Eliminación de mensajes (requiere capacidad DELETE_MESSAGE)
- [ ] Desconectar usuarios (requiere capacidad DISCONNECT_USER)
- [ ] Mensajes con imágenes
- [ ] Indicador de "escribiendo..."
- [ ] Notificaciones de nuevos mensajes
- [ ] Scroll a mensaje específico
- [ ] Búsqueda en mensajes

## 📝 Notas Importantes

### Permisos del Token

El token actual es de **solo lectura** (Anonymous_Viewer). Para enviar mensajes, el backend debe crear el token con capacidad `SEND_MESSAGE`:

```typescript
// En getTokenProvider del backend
const chatToken = await getTokenProvider({
  chatARN,
  username: currentUser.username, // Usuario real
  server: true,
  capabilities: ['SEND_MESSAGE'], // Agregar esta capacidad
});
```

### Usuarios Anónimos

El chat detecta automáticamente usuarios anónimos (`auth.state !== 'authenticated'`) y:

- Muestra los mensajes (solo lectura)
- Oculta el input de envío
- Muestra mensaje "Inicia sesión para participar"

### Auto-reconexión

AWS IVS Chat SDK maneja auto-reconexión automáticamente. Si se pierde la conexión, intentará reconectar.

### Límites

- **Longitud de mensaje:** 500 caracteres (configurable via prop `maxLength`)
- **Rate limiting:** Manejado por AWS IVS Chat
- **Concurrent connections:** Según plan de AWS

## 🐛 Troubleshooting

### "Error al conectar con el chat"

1. Verifica que el `auctionId` sea válido
2. Verifica que existe `chatARN` en la base de datos
3. Revisa los logs del backend en `/api/mobile/protected/chat/get-token`

### "No se pudo enviar el mensaje"

1. Verifica que estés autenticado
2. Verifica que la conexión esté establecida (`connectionState === 'connected'`)
3. Verifica que el token tenga capacidad `SEND_MESSAGE`

### Los mensajes no se actualizan

1. Verifica que los listeners estén registrados correctamente
2. Revisa la consola por errores de WebSocket
3. Verifica que el `chatARN` sea correcto

## 📚 Recursos

- [AWS IVS Chat Documentation](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/)
- [React Native Tutorial - Part 1](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/chat-sdk-react-tutorial-chat-rooms.html)
- [React Native Tutorial - Part 2](https://docs.aws.amazon.com/ivs/latest/ChatUserGuide/chat-sdk-react-tutorial-messages-events.html)
- [amazon-ivs-chat-messaging SDK](https://www.npmjs.com/package/amazon-ivs-chat-messaging)
