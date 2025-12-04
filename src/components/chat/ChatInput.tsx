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

interface ChatInputProps {
  onSend: (message: string) => Promise<boolean>;
  disabled?: boolean;
  isSending?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  isSending = false,
  maxLength = 500,
  placeholder,
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
    <View className='border-gray-200 flex-row items-center gap-2 border-t bg-white px-3 py-2'>
      <Input
        value={message}
        onChangeText={setMessage}
        placeholder={defaultPlaceholder}
        maxLength={maxLength}
        editable={!disabled && !isSending}
        multiline
        numberOfLines={1}
        returnKeyType='send'
        onSubmitEditing={handleSend}
        className={cn(
          'h-10 flex-1 text-[15px]',
          (disabled || isSending) && 'opacity-50'
        )}
      />

      <Button
        mode='primary'
        size='small'
        onPress={handleSend}
        disabled={isSendDisabled}
        isLoading={isSending}
        className='min-w-[70px]'
      >
        {t('chat.send')}
      </Button>
    </View>
  );
};
