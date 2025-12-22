import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { AboutUsContent } from '@/components/info/AboutUsContent';
import { HowItWorksContent } from '@/components/info/HowItWorksContent';
import { FAQsContent } from '@/components/info/FAQsContent';
import { ContactUsContent } from '@/components/info/ContactUsContent';
import { TermsAndConditionsContent } from '@/components/info/TermsAndConditionsContent';
import { PrivacyPolicyContent } from '@/components/info/PrivacyPolicyContent';
import { CookiesPolicyContent } from '@/components/info/CookiesPolicyContent';
import { useFetchLegalContent } from '@/hooks/pages/useFetchLegalContent';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';

export default function InfoScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t, locale } = useTranslation();
  const { data: legalContent, status, errorMessage } = useFetchLegalContent();

  const getTitle = () => {
    switch (page) {
      case 'about-us':
        return t('screens.account.aboutUs');
      case 'how-it-works':
        return t('screens.account.howItWorks');
      case 'faqs':
        return t('screens.account.faqs');
      case 'contact-us':
        return t('screens.account.contactUs');
      case 'terms-and-conditions':
        return t('screens.account.termsAndConditions');
      case 'privacy-policy':
        return t('screens.account.privacyPolicy');
      case 'cookies-policy':
        return t('screens.account.cookiesPolicy');
      default:
        return t('screens.account.aboutUs');
    }
  };

  // Solo cargar legal content para páginas legales
  const isLegalPage =
    page === 'terms-and-conditions' ||
    page === 'privacy-policy' ||
    page === 'cookies-policy';

  const renderContent = () => {
    switch (page) {
      case 'about-us':
        return <AboutUsContent />;
      case 'how-it-works':
        return <HowItWorksContent />;
      case 'faqs':
        return <FAQsContent />;
      case 'contact-us':
        return <ContactUsContent />;
      case 'terms-and-conditions':
        if (!legalContent) return null;
        return (
          <TermsAndConditionsContent
            data={legalContent.termsAndConditions}
            locale={locale}
          />
        );
      case 'privacy-policy':
        if (!legalContent) return null;
        return (
          <PrivacyPolicyContent
            data={legalContent.privacyPolicy}
            locale={locale}
          />
        );
      case 'cookies-policy':
        if (!legalContent) return null;
        return (
          <CookiesPolicyContent
            data={legalContent.cookiesPolicy}
            locale={locale}
          />
        );
      default:
        return <AboutUsContent />;
    }
  };

  // Show loading/error only for legal pages
  if (isLegalPage) {
    if (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) {
      return <Loading locale={locale} />;
    }

    if (status === REQUEST_STATUS.error || !legalContent) {
      return (
        <CustomError
          customMessage={errorMessage}
          refreshRoute={`/(tabs)/account/info/${page}`}
        />
      );
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: getTitle() }} />
      <View className='flex-1'>{renderContent()}</View>
    </>
  );
}
