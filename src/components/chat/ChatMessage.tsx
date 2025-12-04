/**
 * Componente para renderizar un mensaje individual del chat
 * Muestra avatar, username y contenido del mensaje
 */

import React from 'react';
import { View } from 'react-native';
import { ChatMessage as ChatMessageType } from 'amazon-ivs-chat-messaging';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/utils/cn';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { auth } = useAuth();

  // Determinar si el mensaje es del usuario actual
  const currentUsername =
    auth.state === 'authenticated' &&
    auth.session?.user?.user_metadata?.username
      ? auth.session.user.user_metadata.username
      : '';

  const isMine = message.sender.userId === currentUsername;

  // Obtener avatar del atributo o usar default
  const avatar = message.attributes?.profilePicture || '';

  return (
    <View
      className={cn(
        'mx-3 my-1.5 flex-row items-start',
        isMine && 'flex-row-reverse'
      )}
    >
      {/* Avatar - solo para mensajes de otros */}
      {!isMine && (
        <View className='mr-2'>
          {avatar ? (
            <CustomImage
              src={avatar}
              alt={message.sender.userId}
              className='h-8 w-8 rounded-full'
              resizeMode='cover'
            />
          ) : (
            <View className='bg-gray-300 h-8 w-8 items-center justify-center rounded-full'>
              <CustomText
                type='bodysmall'
                className='text-gray-600 font-semibold'
              >
                {message.sender.userId.charAt(0).toUpperCase()}
              </CustomText>
            </View>
          )}
        </View>
      )}

      {/* Contenido del mensaje */}
      <View
        className={cn(
          'max-w-[70%] rounded-xl p-2',
          isMine ? 'bg-blue-500' : 'bg-gray-200'
        )}
      >
        {/* Username - solo para mensajes de otros */}
        {!isMine && (
          <CustomText
            type='bodysmall'
            className='text-gray-700 mb-0.5 font-semibold'
          >
            {message.sender.userId}
          </CustomText>
        )}

        {/* Mensaje */}
        <CustomText
          type='body'
          className={cn('text-[15px]', isMine ? 'text-white' : 'text-gray-900')}
        >
          {message.content}
        </CustomText>
      </View>
    </View>
  );
};
