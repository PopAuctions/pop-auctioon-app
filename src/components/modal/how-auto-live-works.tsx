import { Lang } from '@/types/types';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { CustomText } from '../ui/CustomText';

interface HowAutoLiveWorksModalProps {
  locale: Lang;
  trigger?: (open: () => void) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TEXTS: Record<
  Lang,
  {
    title: string;
    description: string[];
    behavior: string[];
    back: string;
  }
> = {
  es: {
    title: '¡Bienvenido a la subasta automática en vivo!',
    description: ['¿Cómo funciona?:'],
    behavior: [
      'Cada artículo está en subasta durante 60 segundos.  Una vez que el artículo “entra en vivo”, ¡puedes pujar por él!',
      'Cuando han transcurrido 45 segundos, comienza la cuenta regresiva.',
      'Si se realiza una puja mientras la cuenta corre, el temporizador se reinicia y vuelve a empezar la cuenta regresiva.',
      'Cuando la cuenta llega a cero, el artículo se adjudica al mejor postor y automáticamente pasamos al siguiente artículo.',
    ],
    back: 'Atrás',
  },
  en: {
    title: 'Welcome to the live auto auction!',
    description: ['How it works:'],
    behavior: [
      'Each article is on auction for 60 seconds. Once the article goes live, you can place your bid!',
      'After 45 seconds have passed, the countdown begins.',
      'If a bid is placed while the countdown is running, the timer resets and the countdown restarts.',
      'When the countdown reaches zero, the article is awarded to the highest bidder and we automatically move to the next article.',
    ],
    back: 'Back',
  },
};

export function HowAutoLiveWorksModal({
  locale,
  trigger,
  open,
  onOpenChange,
}: HowAutoLiveWorksModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === 'boolean';
  const visible = isControlled ? open! : internalOpen;

  const texts = useMemo(() => TEXTS[locale] ?? TEXTS.es, [locale]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next);
      else setInternalOpen(next);
      if (next) {
        // announce for screen readers
        if (Platform.OS !== 'web') {
          AccessibilityInfo.announceForAccessibility?.(texts.title);
        }
      }
    },
    [isControlled, onOpenChange, texts.title]
  );

  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      {trigger?.(openModal)}
      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <Pressable
          onPress={closeModal}
          className='flex-1 bg-black/50'
          accessibilityRole='button'
          accessibilityLabel={texts.back}
          testID='modal-backdrop'
        >
          <TouchableWithoutFeedback>
            <View className='flex-1 items-center justify-center px-4'>
              <View
                className='w-full max-w-[640px] rounded-lg bg-white px-5 py-5 shadow-lg'
                accessibilityViewIsModal
              >
                <View className='mb-3'>
                  <CustomText
                    type='h2'
                    className='text-center text-cinnabar'
                  >
                    {texts.title}
                  </CustomText>
                  <View className='mt-2'>
                    {texts.description.map((line, i) => (
                      <CustomText
                        key={i}
                        type='h4'
                        className='text-center'
                      >
                        {line}
                      </CustomText>
                    ))}
                  </View>
                </View>

                <View className='mb-4'>
                  <View className='pl-4'>
                    {texts.behavior.map((line, i) => (
                      <View
                        key={i}
                        className='-ml-4 mb-2 flex-row'
                      >
                        <Text className='mr-2 text-lg leading-6'>•</Text>
                        <CustomText type='body'>{line}</CustomText>
                      </View>
                    ))}
                  </View>
                </View>

                <View className='mt-2 flex w-full flex-row justify-center'>
                  <Pressable
                    onPress={closeModal}
                    className='w-1/2 items-center rounded-md bg-cinnabar px-4 py-3 active:opacity-85'
                    accessibilityRole='button'
                    accessibilityLabel={texts.back}
                  >
                    <CustomText
                      type='body'
                      className='text-white'
                    >
                      {texts.back}
                    </CustomText>
                  </Pressable>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </>
  );
}
