export const FIRST_SECTION = [
  {
    name: 'login',
    icon: 'sign-in',
    labelKey: 'screens.account.login',
    href: '/(tabs)/auth/login',
  },
  // {
  //   name: 'register',
  //   icon: 'user-plus',
  //   labelKey: 'screens.account.register',
  //   href: '/(tabs)/auth/register',
  // },
];

export const SECOND_SECTION = [
  {
    name: 'settings',
    icon: 'gear',
    labelKey: 'screens.account.settings',
    href: '/(tabs)/auth/settings',
  },
];

export const THIRD_SECTION = [
  {
    name: 'about-us',
    icon: 'info-circle',
    labelKey: 'screens.account.aboutUs',
    href: '/(tabs)/auth/info/about-us',
  },
  {
    name: 'how-it-works',
    icon: 'question-circle',
    labelKey: 'screens.account.howItWorks',
    href: '/(tabs)/auth/info/how-it-works',
  },
  {
    name: 'faqs',
    icon: 'comments',
    labelKey: 'screens.account.faqs',
    href: '/(tabs)/auth/info/faqs',
  },
  {
    name: 'contact-us',
    icon: 'envelope',
    labelKey: 'screens.account.contactUs',
    href: '/(tabs)/auth/info/contact-us',
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
    href: '/(tabs)/auth/info/privacy-policy',
  },
  {
    name: 'cookies-policy',
    icon: 'file',
    labelKey: 'screens.account.cookiesPolicy',
    href: '/(tabs)/auth/info/cookies-policy',
  },
];
