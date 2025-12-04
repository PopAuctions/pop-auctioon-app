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
  transparent?: boolean;
}

export const ChatMessage = ({
  message,
  transparent = false,
}: ChatMessageProps) => {
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
    <View className='mx-2 my-0.5 flex-row items-start'>
      {/* Avatar - oculto en modo transparente */}
      {!transparent && !isMine && (
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
          'max-w-[85%] rounded-lg px-2 py-1',
          transparent ? 'bg-black/60' : isMine ? 'bg-blue-500' : 'bg-gray-200'
        )}
      >
        {/* Username con avatar inline en modo transparente */}
        <View className='mb-0.5 flex-row items-center gap-1'>
          {transparent && avatar && (
            <CustomImage
              src={avatar}
              alt={message.sender.userId}
              className='h-4 w-4 rounded-full'
              resizeMode='cover'
            />
          )}
          {transparent && !avatar && (
            <View className='h-4 w-4 items-center justify-center rounded-full bg-white/30'>
              <CustomText
                type='bodysmall'
                className='text-[8px] font-semibold text-white'
              >
                {message.sender.userId.charAt(0).toUpperCase()}
              </CustomText>
            </View>
          )}
          <CustomText
            type='bodysmall'
            className={cn(
              'font-bold',
              transparent
                ? 'text-cinnabar drop-shadow-md'
                : isMine
                  ? 'text-white'
                  : 'text-gray-700'
            )}
          >
            {message.sender.userId}
          </CustomText>
        </View>

        {/* Mensaje */}
        <CustomText
          type='body'
          className={cn(
            'text-[13px]',
            transparent
              ? 'text-white drop-shadow-lg'
              : isMine
                ? 'text-white'
                : 'text-gray-900'
          )}
        >
          {message.content}
        </CustomText>
      </View>
    </View>
  );
};
