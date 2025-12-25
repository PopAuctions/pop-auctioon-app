import { View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import {
  ContactUsSchema,
  type ContactUsSchemaType,
} from '@/utils/schemas/contact-us-schema';
import { Checkbox } from 'expo-checkbox';
import { Lang } from '@/types/types';

// Helper function to safely parse bilingual error messages
const parseErrorMessage = (
  message: string | undefined,
  locale: Lang
): string => {
  if (!message) return '';
  try {
    const parsed = JSON.parse(message);
    return parsed[locale] || message;
  } catch {
    return message;
  }
};

export function ContactUsContent() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { protectedPost } = useSecureApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactUsSchemaType>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      wantToSell: false,
    } as ContactUsSchemaType,
  });

  const onSubmit = async (data: ContactUsSchemaType) => {
    setIsSubmitting(true);

    try {
      const response = await protectedPost({
        endpoint: PROTECTED_ENDPOINTS.CONTACT_US.SEND,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          message: data.message,
          sellNote: data.wantToSell
            ? t('screens.contactUs.userWantsToSellNote')
            : undefined,
        },
      });

      if (response.error) {
        callToast({
          variant: 'error',
          description: response.error,
        });
        return;
      }

      if (response.data) {
        callToast({
          variant: 'success',
          description: 'screens.contactUs.successMessage',
        });
        reset();
      }
    } catch (error) {
      callToast({
        variant: 'error',
        description: 'screens.contactUs.errorMessage',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className='flex-1'>
      <View className='p-6'>
        <CustomText
          type='h1'
          className='mb-4 text-center text-cinnabar'
        >
          {t('screens.contactUs.title')}
        </CustomText>

        <CustomText
          type='subtitle'
          className='mb-6 text-center'
        >
          {t('screens.contactUs.subtitle')}
        </CustomText>

        {/* Name */}
        <View className='mb-4'>
          <CustomText
            type='h4'
            className='mb-2'
          >
            {t('screens.contactUs.name')}*
          </CustomText>
          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('screens.contactUs.namePlaceholder')}
                value={value}
                onChangeText={onChange}
                editable={!isSubmitting}
              />
            )}
          />
          {errors.name && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {parseErrorMessage(errors.name.message, locale)}
            </CustomText>
          )}
        </View>

        {/* Email */}
        <View className='mb-4'>
          <CustomText
            type='h4'
            className='mb-2'
          >
            {t('screens.contactUs.email')}*
          </CustomText>
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('screens.contactUs.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!isSubmitting}
              />
            )}
          />
          {errors.email && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {parseErrorMessage(errors.email.message, locale)}
            </CustomText>
          )}
        </View>

        {/* Phone */}
        <View className='mb-4'>
          <CustomText
            type='h4'
            className='mb-2'
          >
            {t('screens.contactUs.phone')}
          </CustomText>
          <Controller
            control={control}
            name='phone'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('screens.contactUs.phonePlaceholder')}
                value={value || ''}
                onChangeText={onChange}
                keyboardType='phone-pad'
                editable={!isSubmitting}
              />
            )}
          />
        </View>

        {/* Message */}
        <View className='mb-4'>
          <CustomText
            type='h4'
            className='mb-2'
          >
            {t('screens.contactUs.message')}*
          </CustomText>
          <Controller
            control={control}
            name='message'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('screens.contactUs.messagePlaceholder')}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={6}
                textAlignVertical='top'
                editable={!isSubmitting}
              />
            )}
          />
          {errors.message && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {parseErrorMessage(errors.message.message, locale)}
            </CustomText>
          )}
        </View>

        {/* Checkbox */}
        <View className='mb-6 flex-row items-center'>
          <Controller
            control={control}
            name='wantToSell'
            render={({ field: { onChange, value } }) => (
              <Checkbox
                value={value}
                onValueChange={onChange}
                disabled={isSubmitting}
                color={value ? '#d75639' : undefined}
              />
            )}
          />
          <CustomText
            type='body'
            className='ml-3'
          >
            {t('screens.contactUs.wantToSell')}
          </CustomText>
        </View>

        {/* Send Button */}
        <Button
          mode='primary'
          size='large'
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className='w-full'
        >
          {isSubmitting
            ? t('screens.contactUs.sending')
            : t('screens.contactUs.send')}
        </Button>

        <View className='h-8' />
      </View>
    </ScrollView>
  );
}
