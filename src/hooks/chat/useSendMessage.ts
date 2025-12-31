/**
 * Hook para enviar mensajes al ChatRoom
 * Maneja el estado de envío y validaciones
 */

import { useState, useCallback } from 'react';
import { ChatRoom, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import * as Sentry from '@sentry/react-native';
import type { LangMap } from '@/types/types';

interface UseSendMessageProps {
  room: ChatRoom | null;
  isConnected: boolean;
  profilePicture?: string;
}

export const useSendMessage = ({
  room,
  isConnected,
  profilePicture = '',
}: UseSendMessageProps) => {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<LangMap | null>(null);

  const sendMessage = useCallback(
    async (message: string): Promise<boolean> => {
      if (!room || !isConnected) {
        return false;
      }

      if (!message.trim()) {
        return false;
      }

      setIsSending(true);
      setSendError(null);

      try {
        const request = new SendMessageRequest(message.trim(), {
          profilePicture,
        });
        await room.sendMessage(request);

        return true;
      } catch (error: any) {
        const errorMessage: LangMap = {
          es: 'No se pudo enviar el mensaje',
          en: 'Could not send message',
        };
        setSendError(errorMessage);

        Sentry.captureException(
          `CHAT_SEND_ERROR: ${error?.message ?? 'Unknown'}`
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [room, isConnected, profilePicture]
  );

  return {
    sendMessage,
    isSending,
    sendError,
    clearError: () => setSendError(null),
  };
};
