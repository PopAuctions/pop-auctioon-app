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
import { useDeviceType } from '@/hooks/useDeviceType';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUsername?: string;
}

export const ChatMessage = ({ message, currentUsername }: ChatMessageProps) => {
  const deviceType = useDeviceType();
  // Obtener avatar del atributo o usar default
  const avatar = message.attributes?.profilePicture || '';
  const isMine = currentUsername && message.sender.userId === currentUsername;

  // Tamaños ajustados según el dispositivo
  const avatarSize = deviceType === 'tablet' ? 'h-5 w-5' : 'h-6 w-6';
  const usernameSize = deviceType === 'tablet' ? 'text-xs' : 'text-sm';
  const messageSize = deviceType === 'tablet' ? 'text-[11px]' : 'text-[13px]';

  return (
    <View className='mx-2 my-0.5 flex-row items-start'>
      {/* Contenido del mensaje - siempre transparente */}
      <View className='max-w-[85%] rounded-lg bg-white/70 px-2 py-1'>
        {/* Username con avatar inline */}
        <View className='mb-0.5 flex-row items-center gap-1'>
          {avatar ? (
            <CustomImage
              src={avatar}
              alt={message.sender.userId}
              className={`${avatarSize} rounded-full`}
              resizeMode='cover'
            />
          ) : (
            <View
              className={`${avatarSize} items-center justify-center rounded-full bg-white`}
            >
              <CustomText
                type='bodysmall'
                className={`${usernameSize} font-semibold ${isMine ? 'text-cinnabar' : 'text-white'}`}
              >
                {message.sender.userId.charAt(0).toUpperCase()}
              </CustomText>
            </View>
          )}
          <CustomText
            type='bodysmall'
            className={cn(
              usernameSize,
              'font-bold drop-shadow-md',
              isMine ? 'text-cinnabar' : 'text-black'
            )}
          >
            {message.sender.userId}
          </CustomText>
        </View>

        {/* Mensaje */}
        <CustomText
          type='body'
          className={`mt-1 pl-1 ${messageSize} text-black drop-shadow-lg`}
        >
          {message.content}
        </CustomText>
      </View>
    </View>
  );
};
