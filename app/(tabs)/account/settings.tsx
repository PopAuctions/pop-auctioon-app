import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/fields/SelectField';
import { Divider } from '@/components/ui/Divider';
import { LANGUAGE_OPTIONS } from '@/constants/app';
import { Lang } from '@/types/types';
import { useOnboarding } from '@/hooks/pages/onboarding/useOnboarding';
import { triggerHaptic } from '@/utils/triggerHaptic';

export default function SettingsScreen() {
  const { t, locale, changeLanguage, isPending } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(locale);
  const { resetOnboarding } = useOnboarding();

  const handleApplyLanguage = () => {
    if (selectedLanguage !== locale) {
      changeLanguage(selectedLanguage as Lang);
      triggerHaptic('success', {
        throttleMs: 120,
      });
    }
  };

  const hasChanges = selectedLanguage !== locale;

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      {isPending && (
        <View className='absolute inset-0 z-10 items-center justify-center bg-white/80'>
          <Loading
            locale={locale}
            customMessage={{
              es: 'Cambiando idioma...',
              en: 'Changing language...',
            }}
          />
        </View>
      )}

      <ScrollView className='flex-1 px-5 pt-4'>
        {/* Language Option */}
        <View className='mb-4'>
          <CustomText
            type='h3'
            className='mb-3'
          >
            {t('screens.account.language')}
          </CustomText>

          <View className='flex-row items-center gap-3'>
            <View className='flex-1'>
              <SelectField
                name='language'
                value={selectedLanguage}
                options={LANGUAGE_OPTIONS}
                placeholder={t('screens.account.selectLanguage')}
                formField={true}
                onChange={(value) => setSelectedLanguage(value || 'es')}
                isDisabled={isPending}
              />
            </View>

            <Button
              onPress={handleApplyLanguage}
              mode='primary'
              disabled={!hasChanges || isPending}
              isLoading={isPending}
              className='self-start'
            >
              <CustomText
                type='body'
                className='text-white'
              >
                {t('commonActions.confirm')}
              </CustomText>
            </Button>
          </View>
        </View>

        <Divider />

        {/* Onboarding Reset */}
        <View className='mb-4 mt-4'>
          <View className='flex-row items-center justify-between gap-3'>
            <View className='flex-1'>
              <CustomText
                type='h3'
                className='mb-1'
              >
                {t('screens.account.tutorial')}
              </CustomText>
              <CustomText
                type='bodysmall'
                className='text-gray-500'
              >
                {t('screens.account.tutorialDescription')}
              </CustomText>
            </View>

            <Button
              onPress={resetOnboarding}
              mode='primary'
              className='self-start'
            >
              <CustomText
                type='body'
                className='text-white'
              >
                {t('screens.account.viewTutorialAgain')}
              </CustomText>
            </Button>
          </View>
        </View>

        <Divider />

        {/* Future options can be added here */}
      </ScrollView>
    </SafeAreaView>
  );
}
