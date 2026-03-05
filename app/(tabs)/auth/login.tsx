import React, { useEffect, useState } from 'react';
import { View, AppState, ScrollView, KeyboardAvoidingView } from 'react-native';
import { supabase } from '@/utils/supabase/supabase-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { PopAuctioonIcon } from '@/components/icons';
import { BackgroundImage } from '@/components/ui/BackgroundImage';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { AppleButton } from '@/components/auth/AppleButton';
import { Divider } from '@/components/ui/Divider';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/useToast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t, locale } = useTranslation();
  const { signInWithPassword, isLoading } = useAuth();
  const { callToast } = useToast(locale);

  const signInWithEmail = async () => {
    const res = await signInWithPassword({ email, password });

    if (!res.success) {
      callToast({
        variant: res.type ?? 'error',
        description: res.message,
      });
      return;
    }

    callToast({
      variant: res.type ?? 'success',
      description: res.message,
    });
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
          behavior='padding'
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
            <View className='w-full rounded-2xl bg-white p-6 shadow-2xl md:max-w-[600px] md:self-center'>
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
