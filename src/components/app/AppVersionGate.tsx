import { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Lang } from '@/types/types';
import type { VersionUpdateType } from '@/utils/appVersion';

interface AppVersionGateProps {
  updateType: VersionUpdateType;
}

interface AppVersionGateTexts {
  forceTitle: string;
  softTitle: string;
  forceDescription: string;
  softDescription: string;
  updateButton: string;
  continueButton: string;
}

const STORE_URLS = {
  android:
    'https://play.google.com/store/apps/details?id=com.popauctioon.popauctioonapp',
  ios: 'https://apps.apple.com/gt/app/popauctioon/id6758241896',
} as const;

const TEXTS: Record<Lang, AppVersionGateTexts> = {
  en: {
    forceTitle: 'Update required',
    softTitle: 'Update available',
    forceDescription: 'You need to update PopAuctioon to keep using the app.',
    softDescription:
      'A newer version of PopAuctioon is available. You can update now or continue using the app.',
    updateButton: 'Update app',
    continueButton: 'Continue for now',
  },
  es: {
    forceTitle: 'Actualización requerida',
    softTitle: 'Actualización disponible',
    forceDescription:
      'Necesitas actualizar PopAuctioon para seguir usando la app.',
    softDescription:
      'Hay una nueva versión de PopAuctioon disponible. Puedes actualizar ahora o continuar usando la app.',
    updateButton: 'Actualizar app',
    continueButton: 'Continuar por ahora',
  },
};

export function AppVersionGate({ updateType }: AppVersionGateProps) {
  const { locale } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const texts = TEXTS[locale] ?? TEXTS.en;

  if (updateType === 'none') return null;
  if (updateType === 'soft' && dismissed) return null;

  const isForceUpdate = updateType === 'force';

  const handleUpdate = async () => {
    try {
      const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
      await Linking.openURL(url);
    } catch (error) {
      console.error('[AppVersionGate] Failed to open store URL:', error);
    }
  };

  return (
    <View className='absolute inset-0 z-50 items-center justify-center bg-black/60 px-6'>
      <View className='w-full rounded-3xl bg-white p-6'>
        <CustomText
          type='body'
          className='text-center font-rubik-bold text-2xl text-black'
        >
          {isForceUpdate ? texts.forceTitle : texts.softTitle}
        </CustomText>

        <CustomText
          type='body'
          className='mt-3 text-center text-base text-neutral-600'
        >
          {isForceUpdate ? texts.forceDescription : texts.softDescription}
        </CustomText>

        <Button
          mode='primary'
          size='small'
          className='mt-6'
          onPress={handleUpdate}
        >
          {texts.updateButton}
        </Button>

        {!isForceUpdate && (
          <Button
            mode='secondary'
            size='small'
            className='mt-2'
            onPress={() => setDismissed(true)}
          >
            {texts.continueButton}
          </Button>
        )}
      </View>
    </View>
  );
}
