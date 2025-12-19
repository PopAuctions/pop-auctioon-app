import React from 'react';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lang } from '@/types/types';
import { CustomText } from '@/components/ui/CustomText';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastActionProps = {
  actionLabel?: string;
  onAction?: () => void;
};

interface ToastComponentProps {
  text1?: string;
  text2?: string;
  props?: ToastActionProps;
}

export const TOAST_TEXTS: Record<Lang, Record<ToastVariant, string>> = {
  en: { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' },
  es: {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
  },
};

const ICONS: Record<ToastVariant, ImageSourcePropType> = {
  success: require('../../assets/icons/toast/success.webp'),
  error: require('../../assets/icons/toast/error.webp'),
  warning: require('../../assets/icons/toast/warning.webp'),
  info: require('../../assets/icons/toast/info.webp'),
};

const containerClass: Record<ToastVariant, string> = {
  success: 'bg-white border-green-500',
  error: 'bg-white border-red-500',
  warning: 'bg-white border-yellow-500',
  info: 'bg-white border-blue-500',
};

const textClass: Record<ToastVariant, string> = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800',
};

const ACTION_WIDTH = 75;

const makeToast = (variant: ToastVariant) => {
  const ToastComponent = ({ text1, text2, props }: ToastComponentProps) => {
    const hasAction = typeof props?.onAction === 'function';

    const handlePress = () => {
      if (!hasAction) return;

      Toast.hide();
      props?.onAction?.();
    };

    return (
      <Pressable
        accessibilityRole='alert'
        disabled={!hasAction}
        className={`mx-4 mt-2 flex-row items-center rounded-2xl border border-l-4 p-3 ${
          containerClass[variant]
        }`}
        style={{
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <Image
          source={ICONS[variant]}
          className='mr-3 h-10 w-10'
          resizeMode='contain'
        />
        <View className='flex-1'>
          {!!text1 && (
            <Text className={`text-base font-semibold ${textClass[variant]}`}>
              {text1}
            </Text>
          )}
          {!!text2 && (
            <Text className={`mt-0.5 text-sm ${textClass[variant]}`}>
              {text2}
            </Text>
          )}
        </View>

        {hasAction ? (
          <Pressable
            onPress={handlePress}
            className='items-cente h-full justify-center border-l px-2'
            style={{
              width: ACTION_WIDTH,
            }}
          >
            <CustomText
              type='body'
              className={`text-center ${textClass[variant]}`}
              numberOfLines={2}
            >
              {props?.actionLabel ?? 'Action'}
            </CustomText>
          </Pressable>
        ) : null}
      </Pressable>
    );
  };

  ToastComponent.displayName = `Toast-${variant}`;

  return ToastComponent;
};

const toastConfig: ToastConfig = {
  success: makeToast('success'),
  error: makeToast('error'),
  warning: makeToast('warning'),
  info: makeToast('info'),
};

export const CustomToast = () => {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      config={toastConfig}
      topOffset={(insets.top || 12) + (Platform.OS === 'android' ? 8 : 0)}
      bottomOffset={insets.bottom || 12}
      visibilityTime={3000}
      autoHide={true}
    />
  );
};

export function ToastProvider() {
  return <CustomToast />;
}
