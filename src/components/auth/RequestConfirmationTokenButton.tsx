import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useToast } from '@/hooks/useToast';
import { Lang, LangMap } from '@/types/types';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';

const TEXTS = {
  es: { tryAgainIn: 'Intenta de nuevo en' },
  en: { tryAgainIn: 'Try again in' },
} as const;

interface RequestConfirmationTokenButtonProps {
  email: string;
  text: string;
  cooldownAmount: number;
  initialCooldownAmount: number;
  locale: Lang;
}

export function RequestConfirmationTokenButton({
  email,
  text,
  cooldownAmount,
  initialCooldownAmount,
  locale,
}: RequestConfirmationTokenButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldownAmount);
  const { protectedPost } = useSecureApi();
  const { callToast } = useToast(locale);

  const handleResendEmail = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setCooldown(cooldownAmount);

    try {
      const response = await protectedPost<LangMap>({
        endpoint: SECURE_ENDPOINTS.NO_AUTH.REQUEST_EMAIL_CONFIRMATION_TOKEN,
        data: {
          email: email,
        },
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        setCooldown(10);
        return;
      }

      const data = response?.data;

      callToast({ variant: 'success', description: data });
    } catch (error: any) {
      Sentry.captureException(
        new Error(`SEND__EMAIL: ${error?.message ?? 'unknown error'}`)
      );

      callToast({
        variant: 'error',
        description: {
          en: 'Error sending email',
          es: 'Error enviando correo',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const isDisabled = isLoading || cooldown > 0;

  return (
    <View className='gap-2'>
      <View className='relative'>
        <Button
          mode='secondary'
          onPress={handleResendEmail}
          disabled={isDisabled}
        >
          {text}
        </Button>

        {isLoading ? (
          <View className='absolute inset-0 items-center justify-center'>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>

      {cooldown > 0 ? (
        <CustomText
          type='body'
          className='text-xs text-slate-400'
        >
          {TEXTS[locale].tryAgainIn} {cooldown}s
        </CustomText>
      ) : null}
    </View>
  );
}
