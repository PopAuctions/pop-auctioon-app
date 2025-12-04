/**
 * Ejemplo de uso del componente Chat en una pantalla de subasta en vivo
 * Este archivo muestra cómo integrar el chat en tu aplicación
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chat } from '@/components/chat/Chat';

/**
 * EJEMPLO 1: Uso básico en pantalla de subasta en vivo
 */
export default function LiveAuctionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      {/* Contenido principal de la subasta */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Subasta en Vivo</Text>
        {/* Aquí va tu stream de video, información del artículo, etc. */}
      </View>

      {/* Chat en vivo */}
      <View style={styles.chatContainer}>
        <Chat
          auctionId={String(id)}
          enabled={true}
          maxLength={500}
        />
      </View>
    </View>
  );
}

/**
 * EJEMPLO 2: Chat en un layout con tabs (horizontal)
 */
export function LiveAuctionWithTabs() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.horizontalLayout}>
        {/* Lado izquierdo: Video y detalles */}
        <View style={styles.leftPanel}>
          <View style={styles.videoContainer}>
            <Text>Video Stream</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text>Detalles del artículo</Text>
          </View>
        </View>

        {/* Lado derecho: Chat */}
        <View style={styles.rightPanel}>
          <Chat
            auctionId={String(id)}
            enabled={true}
            maxLength={500}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * EJEMPLO 3: Chat desplegable en móvil (modal o sheet)
 */
export function LiveAuctionWithModalChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatVisible, setChatVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainContent}>
        {/* Contenido principal */}
        <Text>Video, artículo, bids...</Text>
      </ScrollView>

      {/* Botón flotante para abrir chat */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setChatVisible(true)}
      >
        <Text style={styles.chatButtonText}>💬 Chat</Text>
      </TouchableOpacity>

      {/* Modal con chat */}
      {chatVisible && (
        <View style={styles.chatModal}>
          <View style={styles.chatModalHeader}>
            <Text style={styles.chatModalTitle}>Chat en vivo</Text>
            <TouchableOpacity onPress={() => setChatVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chatModalContent}>
            <Chat
              auctionId={String(id)}
              enabled={chatVisible}
              maxLength={500}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * EJEMPLO 4: Chat condicional (solo en subastas live)
 */
export function ConditionalChatExample() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [auctionStatus] = React.useState<'LIVE' | 'SCHEDULED' | 'FINISHED'>(
    'LIVE'
  );

  const isChatEnabled = auctionStatus === 'LIVE';

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text>Contenido de la subasta</Text>
      </View>

      {/* Chat solo visible cuando la subasta está LIVE */}
      {isChatEnabled ? (
        <View style={styles.chatContainer}>
          <Chat
            auctionId={String(id)}
            enabled={isChatEnabled}
            maxLength={500}
          />
        </View>
      ) : (
        <View style={styles.chatPlaceholder}>
          <Text style={styles.placeholderText}>
            {auctionStatus === 'SCHEDULED'
              ? '💬 El chat estará disponible cuando inicie la subasta'
              : '💬 El chat ha finalizado'}
          </Text>
        </View>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  chatContainer: {
    height: 400,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // Layout horizontal (tablet/desktop)
  horizontalLayout: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  leftPanel: {
    flex: 2,
  },
  rightPanel: {
    flex: 1,
    minWidth: 300,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
  },

  // Chat modal
  chatButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chatButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  chatModalContent: {
    flex: 1,
  },

  // Chat placeholder
  chatPlaceholder: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
