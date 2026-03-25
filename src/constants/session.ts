import { Variant, VariantEnum } from '@/components/ui/FontAwesomeIcon';
import { APP_USER_ROLES } from './user';

export const FIRST_SECTION = [
  {
    name: 'notifications',
    icon: 'bell',
    labelKey: 'screens.account.notifications',
    href: '/(tabs)/account/notifications',
  },
  {
    name: 'articles-won',
    icon: 'trophy',
    labelKey: 'screens.account.articlesWon',
    href: '/(tabs)/account/articles-won',
  },
  {
    name: 'edit-profile',
    icon: 'user',
    labelKey: 'screens.account.editProfile',
    href: '/(tabs)/account/edit-profile',
  },
  {
    name: 'reset-password',
    icon: 'lock',
    labelKey: 'screens.account.resetPassword',
    href: '/(tabs)/account/reset-password',
    showIfOAuth: false,
  },
  {
    name: 'verify-phone',
    icon: 'phone',
    labelKey: 'screens.account.verifyPhone',
    href: '/(tabs)/account/verify-phone',
  },
  {
    name: 'offers-made',
    icon: 'list-alt',
    labelKey: 'screens.account.offersMade',
    href: '/(tabs)/account/offers-made',
  },
  {
    name: 'followed-auctions',
    icon: 'gavel',
    labelKey: 'screens.account.followedAuctions',
    href: '/(tabs)/account/followed-auctions',
  },
  {
    name: 'followed-articles',
    icon: 'shopping-bag',
    labelKey: 'screens.account.followedArticles',
    href: '/(tabs)/account/followed-articles',
  },
  {
    name: 'addresses',
    icon: 'map-marker',
    labelKey: 'screens.account.addresses',
    href: '/(tabs)/account/addresses',
  },
  {
    name: 'billing-info',
    icon: 'credit-card',
    labelKey: 'screens.account.billingInfo',
    href: '/(tabs)/account/billing-info',
  },
  {
    name: 'payments-history',
    icon: 'history',
    labelKey: 'screens.account.paymentsHistory',
    href: '/(tabs)/account/payments-history',
  },
];

export const SECOND_SECTION: {
  name: string;
  icon: string;
  variant: Variant;
  labelKey: string;
  href: string;
  role?: keyof typeof APP_USER_ROLES;
}[] = [
  {
    name: 'settings',
    icon: 'gear',
    variant: VariantEnum.BOLD,
    labelKey: 'screens.account.settings',
    href: '/(tabs)/account/settings',
  },
];

export const THIRD_SECTION = [
  {
    name: 'about-us',
    icon: 'info-circle',
    labelKey: 'screens.account.aboutUs',
    href: '/(tabs)/account/info/about-us',
  },
  {
    name: 'how-it-works',
    icon: 'question-circle',
    labelKey: 'screens.account.howItWorks',
    href: '/(tabs)/account/info/how-it-works',
  },
  {
    name: 'faqs',
    icon: 'comments',
    labelKey: 'screens.account.faqs',
    href: '/(tabs)/account/info/faqs',
  },
  {
    name: 'contact-us',
    icon: 'envelope',
    labelKey: 'screens.account.contactUs',
    href: '/(tabs)/account/info/contact-us',
  },
];

export const FOURTH_SECTION = [
  {
    name: 'terms-and-conditions',
    icon: 'file-text',
    labelKey: 'screens.account.termsAndConditions',
    href: '', // No se usa navegación - se abre directamente el PDF
  },
  {
    name: 'privacy-policy',
    icon: 'shield',
    labelKey: 'screens.account.privacyPolicy',
    href: '/(tabs)/account/info/privacy-policy',
  },
  {
    name: 'cookies-policy',
    icon: 'file',
    labelKey: 'screens.account.cookiesPolicy',
    href: '/(tabs)/account/info/cookies-policy',
  },
];
