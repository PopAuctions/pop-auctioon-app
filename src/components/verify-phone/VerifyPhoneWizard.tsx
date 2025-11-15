import { useState, useRef, useEffect } from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import PhoneInput from 'react-native-international-phone-number';
import type {
  IPhoneInputRef,
  ICountry,
} from 'react-native-international-phone-number';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useVerifyPhone } from '@/hooks/pages/verify-phone/useVerifyPhone';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

type Step = 1 | 2 | 3;

interface VerifyPhoneWizardProps {
  verifiedPhoneNumber: string;
  isPhoneVerified: boolean;
}

export function VerifyPhoneWizard({
  verifiedPhoneNumber,
  isPhoneVerified,
}: VerifyPhoneWizardProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast(locale);
  const {
    sendOtp,
    verifyOtp,
    status,
    errorMessage,
    canResend,
    remainingSeconds,
  } = useVerifyPhone();

  // Always start at step 1
  const [step, setStep] = useState<Step>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const phoneInputRef = useRef<IPhoneInputRef>(null);

  // Show toast when errorMessage changes from hook
  useEffect(() => {
    if (errorMessage) {
      toast.error({ description: errorMessage });
    }
  }, [errorMessage, toast]);

  // Update phone validation when phoneNumber or selectedCountry changes
  useEffect(() => {
    if (phoneInputRef.current) {
      setIsValidPhone(phoneInputRef.current.isValid);
    }
  }, [phoneNumber, selectedCountry]);

  // Step 1: Send OTP
  const handleSendCode = async () => {
    if (!isValidPhone || !phoneNumber) {
      toast.error({
        description: {
          en: 'Please enter a valid phone number',
          es: 'Por favor ingrese un número de teléfono válido',
        },
      });
      return;
    }

    // Get full phone number with country code from ref (remove spaces)
    const fullPhone = (phoneInputRef.current?.fullPhoneNumber || '').replace(
      /\s/g,
      ''
    );

    // Validate that user is not trying to verify an already verified number
    if (
      isPhoneVerified &&
      fullPhone.replace(/\s/g, '') === verifiedPhoneNumber.replace(/\s/g, '')
    ) {
      toast.error({
        description: {
          en: 'This number is already verified. Please enter a different one.',
          es: 'Este número ya está verificado. Ingresa uno diferente.',
        },
      });
      return;
    }

    // Send OTP
    const result = await sendOtp(fullPhone);

    if (result.success) {
      setStep(2);
      setOtpCode(''); // Clear OTP input
    }
  };

  // Step 2: Resend OTP
  const handleResendCode = async () => {
    if (!canResend || !phoneNumber) return;

    // Get full phone number with country code from ref (remove spaces)
    const fullPhone = (phoneInputRef.current?.fullPhoneNumber || '').replace(
      /\s/g,
      ''
    );
    await sendOtp(fullPhone);
  };

  // Step 2: Verify OTP
  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error({
        description: {
          en: 'Please enter the 6-digit code',
          es: 'Por favor ingrese el código de 6 dígitos',
        },
      });
      return;
    }

    // Get full phone number with country code from ref (remove spaces)
    const fullPhone = (phoneInputRef.current?.fullPhoneNumber || '').replace(
      /\s/g,
      ''
    );
    const result = await verifyOtp(fullPhone, otpCode);

    if (result.success) {
      setStep(3);
    } else {
      // Clear OTP input if verification failed
      setOtpCode('');
    }
  };

  // Step 3: Navigate back to account
  const handleGoToProfile = () => {
    router.push('/(tabs)/account');
  };

  const isLoading = status === 'loading';

  return (
    <View className='flex-1 px-6'>
      {/* Title */}
      <CustomText
        type='h1'
        className='mb-6 text-center text-cinnabar'
      >
        {t('screens.verifyPhone.title')}
      </CustomText>

      {/* Step indicator subtitle */}
      <CustomText
        type='h4'
        className='text-gray-600 mb-8 text-center'
      >
        {step === 1 && t('screens.verifyPhone.step1Subtitle')}
        {step === 2 && t('screens.verifyPhone.step2Subtitle')}
        {step === 3 && t('screens.verifyPhone.step3Subtitle')}
      </CustomText>

      {/* STEP 1: Phone Input */}
      {step === 1 && (
        <View className='gap-4'>
          {/* Phone Input with Country Picker */}
          <PhoneInput
            ref={phoneInputRef}
            value={phoneNumber}
            onChangePhoneNumber={setPhoneNumber}
            selectedCountry={selectedCountry}
            onChangeSelectedCountry={setSelectedCountry}
            defaultCountry='ES'
            placeholder={t('screens.verifyPhone.phonePlaceholder')}
            phoneInputStyles={{
              container: {
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12,
              },
              flagContainer: {
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                backgroundColor: 'white',
                justifyContent: 'center',
              },
              flag: {},
              caret: {
                color: '#000',
                fontSize: 16,
              },
              divider: {
                backgroundColor: '#e5e7eb',
              },
              callingCode: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#000',
              },
              input: {
                fontSize: 16,
                color: '#000',
              },
            }}
          />

          {/* Error message */}
          {errorMessage && (
            <CustomText
              type='error'
              className='text-center'
            >
              {errorMessage[locale]}
            </CustomText>
          )}

          {/* Send Code Button */}
          <Button
            mode='primary'
            onPress={handleSendCode}
            disabled={!isValidPhone || !phoneNumber || isLoading}
            className='mt-4'
          >
            {isLoading ? (
              <ActivityIndicator
                color='#fff'
                size='small'
              />
            ) : (
              t('screens.verifyPhone.sendCodeButton')
            )}
          </Button>
        </View>
      )}

      {/* STEP 2: OTP Input */}
      {step === 2 && (
        <View className='gap-4'>
          {/* OTP Code Input */}
          <TextInput
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder={t('screens.verifyPhone.otpPlaceholder')}
            keyboardType='number-pad'
            maxLength={6}
            autoFocus
            className='border-gray-300 rounded-xl border bg-white px-4 py-3 text-base text-black'
          />

          {/* Error message */}
          {errorMessage && (
            <CustomText
              type='error'
              className='text-center'
            >
              {errorMessage[locale]}
            </CustomText>
          )}

          {/* Verify Code Button */}
          <Button
            mode='primary'
            onPress={handleVerifyCode}
            disabled={!otpCode || otpCode.length < 6 || isLoading}
            className='mt-2'
          >
            {isLoading ? (
              <ActivityIndicator
                color='#fff'
                size='small'
              />
            ) : (
              t('screens.verifyPhone.verifyCodeButton')
            )}
          </Button>

          {/* Resend Code Button */}
          <Button
            mode='secondary'
            onPress={handleResendCode}
            disabled={!canResend || isLoading}
            className='mt-2'
          >
            {isLoading ? (
              <ActivityIndicator
                color='#d54444'
                size='small'
              />
            ) : canResend ? (
              t('screens.verifyPhone.resendCodeButton')
            ) : (
              t('screens.verifyPhone.resendCountdown', {
                seconds: remainingSeconds.toString(),
              })
            )}
          </Button>
        </View>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <View className='items-center gap-6'>
          <CustomText
            type='h2'
            className='text-center text-green-600'
          >
            {t('screens.verifyPhone.successMessage')}
          </CustomText>

          <Button
            mode='primary'
            onPress={handleGoToProfile}
            className='mt-4 w-full'
          >
            {t('screens.verifyPhone.goToProfileButton')}
          </Button>
        </View>
      )}
    </View>
  );
}
