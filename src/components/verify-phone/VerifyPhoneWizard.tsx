import { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
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
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

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
  const { callToast } = useToast(locale);
  const { navigateWithAuth } = useAuthNavigation();
  const { sendOtp, verifyOtp, errorMessage, canResend, remainingSeconds } =
    useVerifyPhone();

  // Always start at step 1
  const [step, setStep] = useState<Step>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const phoneInputRef = useRef<IPhoneInputRef>(null);

  // Show toast when errorMessage changes from hook
  useEffect(() => {
    if (errorMessage) {
      callToast({ variant: 'error', description: errorMessage });
    }
  }, [errorMessage, callToast]);

  // Update phone validation when phoneNumber or selectedCountry changes
  useEffect(() => {
    if (phoneInputRef.current) {
      setIsValidPhone(phoneInputRef.current.isValid);
    }
  }, [phoneNumber, selectedCountry]);

  // Step 1: Send OTP
  const handleSendCode = async () => {
    if (!isValidPhone || !phoneNumber) {
      callToast({
        variant: 'error',
        description: 'screens.verifyPhone.invalidPhoneNumber',
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
      callToast({
        variant: 'error',
        description: 'screens.verifyPhone.alreadyVerified',
      });
      return;
    }

    // Send OTP
    setIsSending(true);
    const result = await sendOtp(fullPhone);
    setIsSending(false);

    if (result.success) {
      setStep(2);
      setOtpCode(''); // Clear OTP input
      callToast({
        variant: 'success',
        description: 'screens.verifyPhone.codeSentSuccess',
      });
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
    setIsResending(true);
    await sendOtp(fullPhone);
    setIsResending(false);
  };

  // Step 2: Verify OTP
  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length < 6) {
      callToast({
        variant: 'error',
        description: 'screens.verifyPhone.invalidCode',
      });
      return;
    }

    // Get full phone number with country code from ref (remove spaces)
    const fullPhone = (phoneInputRef.current?.fullPhoneNumber || '').replace(
      /\s/g,
      ''
    );
    setIsVerifying(true);
    const result = await verifyOtp(fullPhone, otpCode);
    setIsVerifying(false);

    if (result.success) {
      setStep(3);
      callToast({
        variant: 'success',
        description: 'screens.verifyPhone.verifiedSuccess',
      });
    } else {
      // Clear OTP input if verification failed
      setOtpCode('');
    }
  };

  // Step 3: Navigate back to account
  const handleGoToProfile = () => {
    navigateWithAuth('/(tabs)/account');
  };

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
            disabled={!isValidPhone || !phoneNumber}
            isLoading={isSending}
            className='mt-4'
            testID='send-otp-button'
          >
            {t('screens.verifyPhone.sendCodeButton')}
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
            disabled={!otpCode || otpCode.length < 6}
            isLoading={isVerifying}
            className='mt-2'
            testID='verify-otp-button'
          >
            {t('screens.verifyPhone.verifyCodeButton')}
          </Button>

          {/* Resend Code Button */}
          <Button
            mode='secondary'
            onPress={handleResendCode}
            disabled={!canResend}
            isLoading={isResending}
            className='mt-2'
            testID='resend-otp-button'
          >
            {canResend
              ? t('screens.verifyPhone.resendCodeButton')
              : t('screens.verifyPhone.resendCountdown', {
                  seconds: remainingSeconds.toString(),
                })}
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
