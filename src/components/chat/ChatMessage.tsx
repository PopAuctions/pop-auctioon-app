/**
 * Componente para renderizar un mensaje individual del chat
 * Muestra avatar, username y contenido del mensaje
 */

import React from 'react';
import { View } from 'react-native';
import { ChatMessage as ChatMessageType } from 'amazon-ivs-chat-messaging';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { cn } from '@/utils/cn';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUsername?: string;
}

export const ChatMessage = ({ message, currentUsername }: ChatMessageProps) => {
  // Obtener avatar del atributo o usar default
  const avatar = message.attributes?.profilePicture || '';
  const isMine = currentUsername && message.sender.userId === currentUsername;

  return (
    <View className='mx-2 my-0.5 flex-row items-start'>
      {/* Contenido del mensaje - siempre transparente */}
      <View className='max-w-[85%] rounded-lg bg-black/30 px-2 py-1'>
        {/* Username con avatar inline */}
        <View className='mb-0.5 flex-row items-center gap-1'>
          {avatar ? (
            <CustomImage
              src={avatar}
              alt={message.sender.userId}
              className='h-6 w-6 rounded-full'
              resizeMode='cover'
            />
          ) : (
            <View className='h-6 w-6 items-center justify-center rounded-full bg-white/30'>
              <CustomText
                type='bodysmall'
                className={`text-sm font-semibold ${isMine ? 'text-cinnabar' : 'text-white'}`}
              >
                {message.sender.userId.charAt(0).toUpperCase()}
              </CustomText>
            </View>
          )}
          <CustomText
            type='bodysmall'
            className={cn(
              'font-bold drop-shadow-md',
              isMine ? 'text-cinnabar' : 'text-white'
            )}
          >
            {message.sender.userId}
          </CustomText>
        </View>

        {/* Mensaje */}
        <CustomText
          type='body'
          className='mt-1 pl-1 text-[13px] text-white drop-shadow-lg'
        >
          {message.content}
        </CustomText>
      </View>
    </View>
  );
};
