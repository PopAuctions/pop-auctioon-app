import React, { useEffect, useState } from 'react';
import {
  View,
  AppState,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/utils/supabase/supabase-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { PopAuctioonIcon } from '@/components/icons';
import { BackgroundImage } from '@/components/ui/BackgroundImage';
import { router } from 'expo-router';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { useToast } from '@/hooks/useToast';
import { useLogin } from '@/hooks/auth/useLogin';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { AppleButton } from '@/components/auth/AppleButton';
import { Divider } from '@/components/ui/Divider';

const errorKeys = {
  INVALID_CREDENTIALS: 'commonErrors.invalidLoginCredentials',
  EMAIL_NOT_CONFIRMED: 'commonErrors.emailNotConfirmed',
  USER_NOT_FOUND: 'commonErrors.userNotFound',
  TOO_MANY_REQUESTS: 'commonErrors.tooManyRequests',
  NETWORK_ERROR: 'commonErrors.networkError',
} as const;

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { login, isLoading } = useLogin();

  const signInWithEmail = async () => {
    const { success, error } = await login(email, password);

    if (!success && error) {
      callToast({ variant: 'error', description: errorKeys[error] });
      return;
    }

    router.replace('/(tabs)/home');
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    return () => sub.remove();
  }, []);

  return (
    <BackgroundImage source={require('@/components/icons/bg-image.webp')}>
      <SafeAreaView
        className='flex-1'
        edges={[]}
      >
        <KeyboardAvoidingView
          className='flex-1'
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className='flex-1'
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            {/* Logo */}
            <View className='mb-6 items-center'>
              <View className='h-20 w-80'>
                <PopAuctioonIcon
                  className='h-full w-full text-white'
                  centered
                />
              </View>
            </View>

            {/* Card */}
            <View className='w-full rounded-2xl bg-white p-6 shadow-2xl'>
              {/* Email */}
              <View className='mb-5'>
                <CustomText
                  type='body'
                  className='text-gray-700 mb-2 font-medium'
                >
                  {t('loginPage.email')}
                </CustomText>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('loginPage.email')}
                  autoCapitalize='none'
                  keyboardType='email-address'
                  autoComplete='email'
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View className='mb-1'>
                <CustomText
                  type='body'
                  className='text-gray-700 mb-2 font-medium'
                >
                  {t('loginPage.password')}
                </CustomText>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('loginPage.password')}
                  secureTextEntry
                  autoCapitalize='none'
                  autoComplete='password'
                  editable={!isLoading}
                />
              </View>

              {/* Forgot password */}
              <View className='mb-4 items-end'>
                <CustomLink
                  href='/(tabs)/auth/reset-password'
                  mode='plainText'
                  isDisabled={isLoading}
                >
                  <CustomText
                    type='body'
                    className='text-cinnabar underline'
                  >
                    {t('loginPage.forgotPassword')}
                  </CustomText>
                </CustomLink>
              </View>

              {/* Primary */}
              <View>
                <Button
                  mode='primary'
                  isLoading={isLoading}
                  disabled={isLoading}
                  onPress={signInWithEmail}
                >
                  {t('loginPage.signIn')}
                </Button>
              </View>

              <View className='my-4 flex-row items-center'>
                <View className='h-px flex-1' />
                <CustomText type='body'>{t('commonActions.or')}</CustomText>
                <View className='bg-gray-200 h-px flex-1' />
              </View>

              <View className='gap-2'>
                <GoogleButton
                  buttonText={t('screens.account.continueWith')}
                  isDisabled={isLoading}
                />
                <AppleButton
                  buttonText={t('screens.account.continueWith')}
                  isDisabled={isLoading}
                />
              </View>

              <Divider className='my-4' />

              {/* Secondary */}
              <CustomLink
                mode='secondary'
                href='/(tabs)/auth/register'
                isDisabled={isLoading}
              >
                {t('loginPage.newAccount')}
              </CustomLink>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundImage>
  );
}
