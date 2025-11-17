import { View, ScrollView } from 'react-native';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetSchema } from '@/utils/schemas';
import { getErrorMessage } from '@/utils/form-errors';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type * as z from 'zod';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { LangMap } from '@/types/types';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { SECURE_ENDPOINTS } from '@/config/api-config';

export default function ResetPasswordScreen() {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

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
      const response = await securePost<LangMap>({
        endpoint: SECURE_ENDPOINTS.USER.RESET_PASSWORD,
        data: {
          email: values.email,
        },
      });

      const data = response?.data;

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }

      callToast({ variant: 'success', description: data });
    } catch (e: any) {
      sentryErrorReport(e?.message, 'CATCH_RESET_PASSWORD - Unexpected error');
      callToast({
        variant: 'error',
        description: {
          en: 'An unexpected error occurred. Please try again later.',
          es: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        },
      });
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
                {getErrorMessage(errors.email.message, locale)}
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
