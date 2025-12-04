/**
 * Componente de input para enviar mensajes en el chat
 * Incluye validación de longitud y estado de envío
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { cn } from '@/utils/cn';
import { CHAT_MAX_LENGTH } from '@/constants/app';

interface ChatInputProps {
  onSend: (message: string) => Promise<boolean>;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
  transparent?: boolean;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  isSending = false,
  placeholder,
  transparent = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('chat.placeholder');

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) {
      return;
    }

    const success = await onSend(message);

    if (success) {
      setMessage(''); // Limpiar input solo si el envío fue exitoso
    }
  };

  const isSendDisabled = disabled || isSending || !message.trim();

  return (
    <View
      className={cn(
        'flex-row items-center gap-2 px-3 py-2',
        transparent
          ? 'rounded-full bg-black/40'
          : 'border-gray-200 border-t bg-white'
      )}
    >
      <Input
        value={message}
        onChangeText={setMessage}
        placeholder={defaultPlaceholder}
        maxLength={CHAT_MAX_LENGTH}
        editable={!disabled && !isSending}
        multiline
        numberOfLines={1}
        returnKeyType='send'
        onSubmitEditing={handleSend}
        className={cn(
          'h-10 flex-1 text-[15px]',
          (disabled || isSending) && 'opacity-50',
          transparent && 'placeholder:text-gray-300 bg-transparent text-white'
        )}
        placeholderTextColor={transparent ? '#d1d5db' : undefined}
      />

      <Button
        mode={transparent ? 'secondary' : 'primary'}
        size='small'
        onPress={handleSend}
        disabled={isSendDisabled}
        isLoading={isSending}
        className={cn('min-w-[70px]', transparent && 'bg-white/90')}
      >
        {t('chat.send')}
      </Button>
    </View>
  );
};
