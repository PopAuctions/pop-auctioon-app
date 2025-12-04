/**
 * Hook para gestionar la conexión y estado del ChatRoom de AWS IVS
 * Maneja la inicialización, conexión, eventos y limpieza del chat
 */

import { useEffect, useState, useRef } from 'react';
import {
  ChatRoom,
  ChatMessage,
  ConnectionState,
} from 'amazon-ivs-chat-messaging';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type { LangMap, RequestStatus } from '@/types/types';
import * as Sentry from '@sentry/react-native';

interface UseChatRoomProps {
  auctionId: string;
  enabled?: boolean;
}

interface ChatTokenResponse {
  chatToken: string;
  chatARN: string;
}

export const useChatRoom = ({
  auctionId,
  enabled = true,
}: UseChatRoomProps) => {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { protectedPost } = useSecureApi();
  const isInitializing = useRef(false);

  // Inicializar ChatRoom
  useEffect(() => {
    if (!enabled || !auctionId || isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    const initializeChatRoom = async () => {
      try {
        setStatus('loading');
        setErrorMessage(null);
        console.log('[CHAT] Solicitando token para auctionId:', auctionId);

        // Obtener token del backend
        const response = await protectedPost<ChatTokenResponse>({
          endpoint: PROTECTED_ENDPOINTS.CHAT.GET_TOKEN,
          data: { auctionId },
        });

        if (response.error) {
          console.error('[CHAT] Error obteniendo token:', response.error);
          setStatus('error');
          setErrorMessage(response.error);
          Sentry.captureException(
            `CHAT_TOKEN_ERROR: ${JSON.stringify(response.error)} | auctionId: ${auctionId}`
          );
          return;
        }

        if (!response.data?.chatToken) {
          console.error('[CHAT] No se recibió token');
          const message: LangMap = {
            en: 'Could not get chat token',
            es: 'No se pudo obtener el token del chat',
          };
          setStatus('error');
          setErrorMessage(message);
          return;
        }

        const { chatToken } = response.data;
        console.log('[CHAT] Token obtenido exitosamente');

        // Crear instancia de ChatRoom
        const chatRoom = new ChatRoom({
          regionOrUrl: process.env.EXPO_PUBLIC_AWS_REGION as string,
          tokenProvider: async () =>
            await Promise.resolve({
              token: chatToken,
              sessionExpirationTime: new Date(Date.now() + 3600000), // 1 hora
              tokenExpirationTime: new Date(Date.now() + 3600000),
            }),
        });

        // Listeners de conexión
        const unsubscribeConnecting = chatRoom.addListener('connecting', () => {
          console.log('[CHAT] Conectando...');
          setConnectionState('connecting');
        });

        const unsubscribeConnected = chatRoom.addListener('connect', () => {
          console.log('[CHAT] Conectado');
          setConnectionState('connected');
          setStatus('success');
        });

        const unsubscribeDisconnected = chatRoom.addListener(
          'disconnect',
          () => {
            console.log('[CHAT] Desconectado');
            setConnectionState('disconnected');
          }
        );

        // Listener de mensajes
        const unsubscribeMessage = chatRoom.addListener(
          'message',
          (message: ChatMessage) => {
            console.log('[CHAT] Nuevo mensaje:', message.sender.userId);
            setMessages((prev) => {
              // Evitar duplicados
              if (prev.some((msg) => msg.id === message.id)) {
                return prev;
              }
              return [...prev, message];
            });
          }
        );

        // Listener de mensajes eliminados
        const unsubscribeMessageDelete = chatRoom.addListener(
          'messageDelete',
          (event) => {
            console.log('[CHAT] Mensaje eliminado:', event.id);
            setMessages((prev) => prev.filter((msg) => msg.id !== event.id));
          }
        );

        // Conectar al chat
        chatRoom.connect();
        setRoom(chatRoom);

        // Cleanup
        return () => {
          console.log('[CHAT] Limpiando conexión');
          unsubscribeConnecting();
          unsubscribeConnected();
          unsubscribeDisconnected();
          unsubscribeMessage();
          unsubscribeMessageDelete();
          chatRoom.disconnect();
        };
      } catch (error: any) {
        console.error('[CHAT] Error inicializando:', error);
        const message: LangMap = {
          en: 'Error initializing chat',
          es: 'Error al inicializar el chat',
        };
        setStatus('error');
        setErrorMessage(message);
        Sentry.captureException(
          `CHAT_INIT_ERROR: ${error?.message ?? 'Unknown'} | auctionId: ${auctionId}`
        );
      } finally {
        isInitializing.current = false;
      }
    };

    const cleanup = initializeChatRoom();

    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [auctionId, enabled, protectedPost]);

  return {
    room,
    messages,
    connectionState,
    status,
    errorMessage,
    setErrorMessage,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
  };
};
