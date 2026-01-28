import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomError } from '@/components/ui/CustomError';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { REQUEST_EMAIL_COOLDOWN } from '@/constants';
import { RequestConfirmationTokenButton } from '@/components/auth/RequestConfirmationTokenButton';

export default function ConfirmEmailScreen() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
  }>();

  const email = params.email;
  const confirmEmail = t('screens.confirmEmail');

  if (!email) {
    return (
      <CustomError
        customMessage={{
          es: 'Falta el correo electrónico.',
          en: 'Email is missing.',
        }}
        refreshRoute='/(tabs)/auth/confirm-email'
      />
    );
  }

  return (
    <ScrollView
      className='flex-1 bg-white'
      contentContainerClassName='flex-1 items-center justify-center px-5'
    >
      {/* Title */}
      <CustomText
        type='h1'
        className='text-center text-cinnabar'
      >
        {confirmEmail.title}
      </CustomText>

      {/* Card */}
      <View className='mt-5 w-11/12 max-w-[700px] rounded-3xl bg-white p-6 shadow-md'>
        <View className='gap-4'>
          <CustomText
            type='body'
            className='text-pretty'
          >
            {confirmEmail.p1}{' '}
            <CustomText
              type='body'
              className='text-cinnabar'
            >
              {email}
            </CustomText>
          </CustomText>

          <CustomText
            type='body'
            className='text-pretty'
          >
            {confirmEmail.p2}
          </CustomText>

          <View className='gap-2'>
            <CustomText
              type='body'
              className='text-pretty text-base'
            >
              {confirmEmail.didntReceive}
            </CustomText>

            <RequestConfirmationTokenButton
              email={email}
              text={confirmEmail.resendEmail}
              cooldownAmount={REQUEST_EMAIL_COOLDOWN}
              initialCooldownAmount={REQUEST_EMAIL_COOLDOWN}
              locale={locale}
            />
          </View>

          <View className='items-center'>
            <Button
              mode='primary'
              onPress={() => router.push('/(tabs)/auth/login')}
            >
              {confirmEmail.goToLogin}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
