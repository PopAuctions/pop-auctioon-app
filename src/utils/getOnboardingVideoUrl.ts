import { DEFAULT_LANG, type Lang } from '@/i18n/locales';
import type { OnboardingVideo } from '@/types/types';

type OnboardingVideoLang = Lang | 'it';

export function getOnboardingVideoUrl(
  data: OnboardingVideo,
  lang: OnboardingVideoLang
): string {
  return data.videos[lang] ?? data.videos[DEFAULT_LANG] ?? data.videoUrl;
}
