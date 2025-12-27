import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { AboutUsContent } from '@/components/info/AboutUsContent';
import { HowItWorksContent } from '@/components/info/HowItWorksContent';
import { FAQsContent } from '@/components/info/FAQsContent';
import { ContactUsContent } from '@/components/info/ContactUsContent';
import { PrivacyPolicyContent } from '@/components/info/PrivacyPolicyContent';
import { CookiesPolicyContent } from '@/components/info/CookiesPolicyContent';
import { useFetchLegalContent } from '@/hooks/pages/useFetchLegalContent';
import { useFetchInfo } from '@/hooks/pages/useFetchInfo';
import { Loading } from '@/components/ui/Loading';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';

export default function InfoScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t, locale } = useTranslation();
  const { data: legalContent, status, errorMessage } = useFetchLegalContent();
  const {
    data: infoContent,
    status: infoStatus,
    errorMessage: infoErrorMessage,
  } = useFetchInfo();

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
      case 'privacy-policy':
        return t('screens.account.privacyPolicy');
      case 'cookies-policy':
        return t('screens.account.cookiesPolicy');
      default:
        return t('screens.account.aboutUs');
    }
  };

  // Determinar tipo de página
  const isLegalPage = page === 'privacy-policy' || page === 'cookies-policy';

  const isInfoPage =
    page === 'about-us' || page === 'how-it-works' || page === 'faqs';

  const renderContent = () => {
    switch (page) {
      case 'about-us':
        if (!infoContent) return null;
        return (
          <AboutUsContent
            data={infoContent.aboutUs}
            locale={locale}
          />
        );
      case 'how-it-works':
        if (!infoContent) return null;
        return (
          <HowItWorksContent
            data={infoContent.howItWorks}
            locale={locale}
          />
        );
      case 'faqs':
        if (!infoContent) return null;
        return (
          <FAQsContent
            data={infoContent.faqs}
            locale={locale}
          />
        );
      case 'contact-us':
        return <ContactUsContent />;
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
        if (!infoContent) return null;
        return (
          <AboutUsContent
            data={infoContent.aboutUs}
            locale={locale}
          />
        );
    }
  };

  // Loading/error para páginas legales
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

  // Loading/error para páginas info
  if (isInfoPage) {
    if (
      infoStatus === REQUEST_STATUS.loading ||
      infoStatus === REQUEST_STATUS.idle
    ) {
      return <Loading locale={locale} />;
    }

    if (infoStatus === REQUEST_STATUS.error || !infoContent) {
      return (
        <CustomError
          customMessage={infoErrorMessage}
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
