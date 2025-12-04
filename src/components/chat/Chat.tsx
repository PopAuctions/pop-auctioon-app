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
  const { t } = useTranslation();
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

  // Hook para enviar mensajes
  const { sendMessage, isSending, sendError } = useSendMessage({
    room,
    isConnected,
  });

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

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

  // Estado de carga (connecting)
  if (connectionState === 'connecting') {
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

  // Error de conexión (disconnected sin room)
  if (connectionState === 'disconnected' && !room) {
    return (
      <CustomError
        customMessage={{
          es: t('chat.connectionError'),
          en: t('chat.connectionError'),
        }}
        refreshRoute='/(tabs)/auctions'
      />
    );
  }

  return (
    <View className='flex-1 overflow-hidden rounded-2xl'>
      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        className='bg-transparent'
      />

      {/* Error de envío */}
      {sendError && (
        <View className='border-l-4 border-cinnabar bg-red-100 px-4 py-2'>
          <CustomText
            type='bodysmall'
            className='text-red-900'
          >
            {sendError}
          </CustomText>
        </View>
      )}

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
        <View className='rounded-full bg-black/40 px-3 py-2'>
          <CustomText
            type='bodysmall'
            className='text-center text-white'
          >
            {t('chat.loginToChat')}
          </CustomText>
        </View>
      )}
    </View>
  );
};
