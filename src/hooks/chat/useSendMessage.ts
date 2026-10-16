/**
 * Hook para enviar mensajes al ChatRoom
 * Maneja el estado de envío y validaciones
 */

import { useState, useCallback } from 'react';
import { ChatRoom, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import * as Sentry from '@sentry/react-native';
import type { MessageKey } from '@/i18n';

const CHAT_SEND_FAILED = 'errors.chat.sendFailed' as const satisfies MessageKey;

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
  const [sendError, setSendError] = useState<MessageKey | null>(null);

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
        setSendError(CHAT_SEND_FAILED);

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
