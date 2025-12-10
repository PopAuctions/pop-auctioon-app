/**
 * Modal que muestra información del stream en vivo
 * Usado en la pantalla de live auction
 */

import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';

interface StreamInfoModalProps {
  visible: boolean;
  onClose: () => void;
  auctionId: string;
  username: string;
  streamUrl: string;
}

export const StreamInfoModal = ({
  visible,
  onClose,
  auctionId,
  username,
  streamUrl,
}: StreamInfoModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      onRequestClose={onClose}
    >
      <View className='flex-1 items-center justify-center bg-black/70'>
        <View className='mx-4 w-full max-w-md rounded-2xl bg-white p-6'>
          {/* Header */}
          <View className='mb-4 flex-row items-center justify-between'>
            <CustomText
              type='subtitle'
              className='text-xl'
            >
              {t('screens.liveAuction.streamInfo')}
            </CustomText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name='close'
                size={28}
                color='#374151'
              />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View className='space-y-4'>
            <View>
              <CustomText
                type='bodysmall'
                className='text-gray-600 mb-1 font-semibold'
              >
                {t('screens.liveAuction.auctionId')}
              </CustomText>
              <CustomText
                type='body'
                className='text-gray-900'
              >
                {auctionId}
              </CustomText>
            </View>

            <View>
              <CustomText
                type='bodysmall'
                className='text-gray-600 mb-1 font-semibold'
              >
                {t('screens.liveAuction.username')}
              </CustomText>
              <CustomText
                type='body'
                className='text-gray-900'
              >
                {username || t('screens.liveAuction.anonymous')}
              </CustomText>
            </View>

            <View>
              <CustomText
                type='bodysmall'
                className='text-gray-600 mb-1 font-semibold'
              >
                {t('screens.liveAuction.chatStatus')}
              </CustomText>
              <CustomText
                type='body'
                className='text-gray-900'
              >
                {t('screens.liveAuction.connected')}
              </CustomText>
            </View>

            <View>
              <CustomText
                type='bodysmall'
                className='text-gray-600 mb-1 font-semibold'
              >
                {t('screens.liveAuction.url')}
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-gray-900'
                numberOfLines={2}
              >
                {streamUrl}
              </CustomText>
            </View>
          </View>

          {/* Botón Cerrar */}
          <Button
            mode='primary'
            onPress={onClose}
            className='mt-6'
          >
            {t('screens.liveAuction.close')}
          </Button>
        </View>
      </View>
    </Modal>
  );
};
