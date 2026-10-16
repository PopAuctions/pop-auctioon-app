import { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { VersionUpdateType } from '@/utils/appVersion';
import { APP_STORE_URLS } from '@/constants/app';

interface AppVersionGateProps {
  updateType: VersionUpdateType;
}

export function AppVersionGate({ updateType }: AppVersionGateProps) {
  const { locale, t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const texts = t('components.appVersionGate', { locale });

  if (updateType === 'none') return null;
  if (updateType === 'soft' && dismissed) return null;

  const isForceUpdate = updateType === 'force';

  const handleUpdate = async () => {
    try {
      const url =
        Platform.OS === 'ios' ? APP_STORE_URLS.ios : APP_STORE_URLS.android;
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
