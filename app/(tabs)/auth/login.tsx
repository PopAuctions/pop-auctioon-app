import React, { useState } from 'react';
import {
  Alert,
  View,
  AppState,
  TouchableOpacity,
  ScrollView,
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

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  // WIP: remove states and use useForm from react-hook-form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      // Login exitoso - redirigir al home y reemplazar la pantalla de login
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    } else {
      setEmail('');
      setPassword('');
      // Registro exitoso con sesión activa - redirigir al home y reemplazar login
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  }

  async function resetPassword() {
    if (!email) {
      Alert.alert('Please enter your email address first');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Check your email for password reset instructions');
    }
    setLoading(false);
  }

  return (
    <BackgroundImage source={require('@/components/icons/bg-image.webp')}>
      <SafeAreaView
        className='flex-1'
        edges={['top']}
      >
        <ScrollView
          className='flex-1'
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className='flex-1 px-5 pt-10'>
            {/* Logo/Title Section */}
            <View className='mb-10 items-center'>
              <View className='h-12 w-80'>
                <PopAuctioonIcon
                  className='h-full w-full text-white'
                  centered={true}
                />
              </View>
            </View>
            {/* Form Container */}
            <View className='rounded-2xl  p-6 shadow-2xl backdrop-blur-sm'>
              <View className='mb-5'>
                <CustomText
                  type='body'
                  className='text-gray-700 mb-2 font-medium'
                >
                  {t('loginPage.email')}
                </CustomText>
                <Input
                  onChangeText={(text: string) => setEmail(text)}
                  value={email}
                  placeholder={t('loginPage.email')}
                  autoCapitalize='none'
                  keyboardType='email-address'
                  autoComplete='email'
                  editable={!loading}
                />
              </View>

              <View className='mb-5'>
                <CustomText
                  type='body'
                  className='text-gray-700 mb-2 font-medium'
                >
                  {t('loginPage.password')}
                </CustomText>
                <Input
                  onChangeText={(text: string) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder={t('loginPage.password')}
                  autoCapitalize='none'
                  autoComplete='password'
                  editable={!loading}
                />
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                className='mb-6 items-end'
                onPress={resetPassword}
              >
                <CustomText
                  type='body'
                  className='text-cinnabar'
                >
                  {t('loginPage.forgotPassword')}
                </CustomText>
              </TouchableOpacity>

              {/* Buttons */}
              <View className='mb-4'>
                <Button
                  mode='primary'
                  isLoading={loading}
                  disabled={loading}
                  onPress={signInWithEmail}
                >
                  {t('loginPage.logIn')}
                </Button>
              </View>

              <View className='mb-4'>
                <Button
                  mode='secondary'
                  isLoading={loading}
                  disabled={loading}
                  onPress={signUpWithEmail}
                >
                  {t('loginPage.newAccount')}
                </Button>
              </View>
            </View>

            {/* Spacer para empujar el footer hacia abajo */}
            <View className='flex-1' />

            {/* Footer con links */}
            <View className='mb-6 mt-6 items-center'>
              <View className='flex-row flex-wrap justify-center gap-3'>
                <CustomLink
                  href='/(tabs)/auth/info/about-us'
                  mode='plainText'
                >
                  <CustomText
                    type='bodysmall'
                    className='text-white'
                  >
                    {t('screens.account.aboutUs')}
                  </CustomText>
                </CustomLink>
                <CustomText
                  type='bodysmall'
                  className='text-white'
                >
                  •
                </CustomText>
                <CustomLink
                  href='/(tabs)/auth/info/how-it-works'
                  mode='plainText'
                >
                  <CustomText
                    type='bodysmall'
                    className='text-white'
                  >
                    {t('screens.account.howItWorks')}
                  </CustomText>
                </CustomLink>
                <CustomText
                  type='bodysmall'
                  className='text-white'
                >
                  •
                </CustomText>
                <CustomLink
                  href='/(tabs)/auth/info/faqs'
                  mode='plainText'
                >
                  <CustomText
                    type='bodysmall'
                    className='text-white'
                  >
                    {t('screens.account.faqs')}
                  </CustomText>
                </CustomLink>
                <CustomText
                  type='bodysmall'
                  className='text-white'
                >
                  •
                </CustomText>
                <CustomLink
                  href='/(tabs)/auth/info/contact-us'
                  mode='plainText'
                >
                  <CustomText
                    type='bodysmall'
                    className='text-white'
                  >
                    {t('screens.account.contactUs')}
                  </CustomText>
                </CustomLink>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundImage>
  );
}
