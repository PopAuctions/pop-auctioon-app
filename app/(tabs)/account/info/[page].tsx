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

export default function InfoScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t } = useTranslation();

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
        return <TermsAndConditionsContent />;
      case 'privacy-policy':
        return <PrivacyPolicyContent />;
      case 'cookies-policy':
        return <CookiesPolicyContent />;
      default:
        return <AboutUsContent />;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: getTitle() }} />
      <View className='flex-1'>{renderContent()}</View>
    </>
  );
}
