import React from 'react';
import { View, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { Lang } from '@/types/types';

export default function SettingsScreen() {
  const { t, locale, changeLanguage, isPending } = useTranslation();

  const toggleLanguage = () => {
    const newLocale: Lang = locale === 'es' ? 'en' : 'es';
    changeLanguage(newLocale);
  };

  const isEnglish = locale === 'en';

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
        <View className='border-gray-200 mb-3 flex-row items-center justify-between border-b py-4'>
          <View className='flex-1'>
            <CustomText
              type='h3'
              className=''
            >
              {t('screens.account.language')}
            </CustomText>
            <CustomText
              type='bodysmall'
              className='text-gray-500 mt-1'
            >
              {t('screens.account.selectedLanguage')}
            </CustomText>
          </View>
          <Switch
            trackColor={{ false: '#e5e7eb', true: '#d75639' }}
            thumbColor='#ffffff'
            ios_backgroundColor='#e5e7eb'
            onValueChange={toggleLanguage}
            value={isEnglish}
            disabled={isPending}
          />
        </View>

        {/* Future options can be added here */}
      </ScrollView>
    </SafeAreaView>
  );
}
