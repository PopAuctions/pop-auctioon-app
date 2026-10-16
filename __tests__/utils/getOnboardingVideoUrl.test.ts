import { DEFAULT_LANG, SUPPORTED_LANGUAGES, type Lang } from '@/i18n/locales';
import type { OnboardingVideo } from '@/types/types';
import { getOnboardingVideoUrl } from '@/utils/getOnboardingVideoUrl';

const data: OnboardingVideo = {
  id: 'onboarding',
  title: Object.fromEntries(
    SUPPORTED_LANGUAGES.map((lang) => [lang, `${lang}-title`])
  ) as Record<Lang, string>,
  description: Object.fromEntries(
    SUPPORTED_LANGUAGES.map((lang) => [lang, `${lang}-description`])
  ) as Record<Lang, string>,
  videoUrl: 'default-video',
  videos: {
    es: 'es-video',
    en: 'en-video',
    it: 'it-video',
  },
  bgColor: '#ffffff',
};

describe('getOnboardingVideoUrl', () => {
  it.each(SUPPORTED_LANGUAGES)(
    'uses the localized video or registered default for %s',
    (lang) => {
      expect(getOnboardingVideoUrl(data, lang)).toBe(
        data.videos[lang] ?? data.videos[DEFAULT_LANG]
      );
    }
  );

  it('preserves the existing Italian onboarding video', () => {
    expect(getOnboardingVideoUrl(data, 'it')).toBe(data.videos.it);
  });
});
