/**
 * Hook para enviar mensajes al ChatRoom
 * Maneja el estado de envío y validaciones
 */

import { useState, useCallback } from 'react';
import { ChatRoom, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import * as Sentry from '@sentry/react-native';

interface UseSendMessageProps {
  room: ChatRoom | null;
  isConnected: boolean;
  profilePicture?: string;
}

export const useSendMessage = ({
  room,
  isConnected,
  profilePicture,
}: UseSendMessageProps) => {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string): Promise<boolean> => {
      if (!room || !isConnected) {
        console.log('[CHAT] No se puede enviar: no hay conexión');
        return false;
      }

      if (!message.trim()) {
        console.log('[CHAT] No se puede enviar: mensaje vacío');
        return false;
      }

      setIsSending(true);
      setSendError(null);

      try {
        console.log('[CHAT] Enviando mensaje...');

        // Crear request con atributos opcionales
        const attributes = profilePicture ? { profilePicture } : undefined;
        const request = new SendMessageRequest(message.trim(), attributes);

        await room.sendMessage(request);

        console.log('[CHAT] Mensaje enviado exitosamente');
        return true;
      } catch (error: any) {
        console.error('[CHAT] Error enviando mensaje:', error);
        const errorMessage = 'No se pudo enviar el mensaje';
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
