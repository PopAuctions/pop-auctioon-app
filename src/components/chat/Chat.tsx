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
import { cn } from '@/utils/cn';

interface ChatProps {
  auctionId: string;
  enabled?: boolean;
  maxLength?: number;
}

export const Chat = ({
  auctionId,
  enabled = true,
  maxLength = 500,
}: ChatProps) => {
  const { auth } = useAuth();
  const { t, locale } = useTranslation();
  const flatListRef = useRef<FlatList>(null);

  // Hook de conexión al chat
  const { room, messages, connectionState, errorMessage, isConnected } =
    useChatRoom({
      auctionId,
      enabled,
    });

  // Obtener datos del usuario
  const currentUser =
    auth.state === 'authenticated' ? auth.session?.user?.user_metadata : null;
  const profilePicture = currentUser?.profilePicture || '';
  const isAnonymous = auth.state !== 'authenticated';

  // Hook para enviar mensajes
  const { sendMessage, isSending, sendError } = useSendMessage({
    room,
    isConnected,
    profilePicture,
  });

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Renderizar cada mensaje
  const renderMessage = ({ item }: { item: ChatMessageType }) => (
    <ChatMessage message={item} />
  );

  // Estado de carga
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

  // Error de conexión
  if (errorMessage) {
    return (
      <View className='flex-1 items-center justify-center rounded-xl bg-white p-6'>
        <CustomText
          type='h4'
          className='mb-2 text-center text-cinnabar'
        >
          {errorMessage[locale] || errorMessage.es}
        </CustomText>
        <CustomText
          type='bodysmall'
          className='text-gray-600 text-center'
        >
          {t('chat.errorRetry')}
        </CustomText>
      </View>
    );
  }

  return (
    <View className='flex-1 overflow-hidden rounded-xl bg-white'>
      {/* Header con estado de conexión */}
      <View className='flex-row items-center justify-between rounded-t-xl bg-cinnabar px-4 py-3'>
        <CustomText
          type='h4'
          className='text-white'
        >
          {t('chat.title')}
        </CustomText>
        <View
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center py-8'>
            <CustomText
              type='body'
              className='text-gray-400 text-center'
            >
              {t('chat.noMessages')}
            </CustomText>
          </View>
        }
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
          maxLength={maxLength}
          placeholder={
            isConnected ? t('chat.placeholder') : t('chat.disconnected')
          }
        />
      ) : (
        <View className='border-gray-200 bg-gray-50 border-t px-4 py-3'>
          <CustomText
            type='bodysmall'
            className='text-gray-600 text-center'
          >
            {t('chat.loginToChat')}
          </CustomText>
        </View>
      )}
    </View>
  );
};
