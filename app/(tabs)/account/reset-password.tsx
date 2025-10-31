import { View, ScrollView, Alert } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetSchema } from '@/utils/schemas';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase/supabase-store';
import type * as z from 'zod';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: 'popauctioonapp://reset-password', // Deep link para cuando hagan clic en el email
        }
      );

      if (error) {
        Alert.alert(
          t('commonActions.error'),
          t('screens.resetPassword.errorMessage')
        );
        return;
      }

      Alert.alert(
        t('commonActions.ok'),
        t('screens.resetPassword.successMessage'),
        [
          {
            text: t('commonActions.ok'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        t('commonActions.error'),
        t('screens.resetPassword.errorMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView className='flex-1'>
        <View className='p-6'>
          {/* Título */}
          <CustomText
            type='h1'
            className='mb-2 text-center text-black'
          >
            {t('screens.resetPassword.title')}
          </CustomText>

          {/* Espaciado */}
          <View className='h-12' />

          {/* Input de Email */}
          <View className='mb-6'>
            <CustomText
              type='body'
              className='mb-2 text-black'
            >
              {t('screens.resetPassword.emailLabel')}
            </CustomText>
            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={t('screens.resetPassword.emailPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  editable={!loading}
                />
              )}
            />
            {errors.email && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {errors.email.message}
              </CustomText>
            )}
          </View>

          {/* Botón Send reset link */}
          <Button
            mode='primary'
            onPress={handleSubmit(onSubmit)}
            isLoading={loading}
            className='mb-4'
          >
            {t('screens.resetPassword.sendResetLink')}
          </Button>

          {/* Botón Back */}
          <Button
            mode='secondary'
            onPress={handleBack}
            disabled={loading}
          >
            {t('screens.resetPassword.back')}
          </Button>

          {/* Espaciado final */}
          <View className='h-8' />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
