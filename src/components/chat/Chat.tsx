/**
 * Componente principal del chat en vivo
 * Integra ChatRoom, lista de mensajes e input
 */

import React, { useRef, useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChatRoom } from '@/hooks/chat/useChatRoom';
import { useSendMessage } from '@/hooks/chat/useSendMessage';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { ChatMessage as ChatMessageType } from 'amazon-ivs-chat-messaging';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { useToast } from '@/hooks/useToast';

interface ChatProps {
  auctionId: string;
  enabled?: boolean;
  username?: string;
}

export const Chat = ({
  auctionId,
  enabled = true,
  username: propUsername,
}: ChatProps) => {
  const { auth } = useAuth();
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const flatListRef = useRef<FlatList>(null);

  // Si no se pasa username, será usuario anónimo
  const username = propUsername || '';
  const isAnonymous = auth.state !== 'authenticated' || !username;

  // Hook de conexión al chat
  const { room, messages, connectionState, isConnected, status, errorMessage } =
    useChatRoom({
      auctionId,
      username,
      enabled,
    });

  const messagesData = React.useMemo(() => [...messages].reverse(), [messages]);

  // Hook para enviar mensajes
  const { sendMessage, isSending, sendError } = useSendMessage({
    room,
    isConnected,
  });

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  // Mostrar toast cuando hay error de envío
  useEffect(() => {
    if (sendError) {
      callToast({ variant: 'error', description: sendError });
    }
  }, [sendError, callToast]);

  // Renderizar cada mensaje (siempre transparente)
  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage
      message={item}
      currentUsername={username}
    />
  );

  // Estado de carga inicial (idle o loading del hook)
  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return (
      <View className='flex-1 items-center justify-center rounded-xl bg-white p-6'>
        <ActivityIndicator
          size='large'
          color='#DC2626'
        />
        <CustomText
          type='body'
          className='text-gray-600 mt-3 text-center'
        >
          {t('chat.connecting')}
        </CustomText>
      </View>
    );
  }

  // Estado de error al obtener token o inicializar
  if (status === REQUEST_STATUS.error && errorMessage) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/auctions'
      />
    );
  }

  // Error de conexión (disconnected sin room después de intentar conectar)
  if (
    connectionState === 'disconnected' &&
    !room &&
    status === REQUEST_STATUS.success
  ) {
    return (
      <CustomError
        customMessage={{
          es: 'Error al conectar con el chat',
          en: 'Failed to connect to chat',
        }}
        refreshRoute='/(tabs)/auctions'
      />
    );
  }

  return (
    <View className='flex-1'>
      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messagesData}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        keyboardDismissMode='interactive'
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator
        className='bg-transparent'
      />

      {/* Input - solo para usuarios autenticados */}
      {!isAnonymous ? (
        <ChatInput
          onSend={sendMessage}
          disabled={!isConnected}
          isSending={isSending}
          placeholder={
            isConnected ? t('chat.placeholder') : t('chat.disconnected')
          }
        />
      ) : (
        <CustomText
          type='h4'
          className='text-center text-xl text-cinnabar underline'
        >
          {t('chat.loginToChat')}
        </CustomText>
      )}
    </View>
  );
};
