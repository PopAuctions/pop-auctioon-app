import { useState, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type { OnboardingSlide, OnboardingTexts } from '@/types/types';

type OnboardingApiResponse = {
  slides: OnboardingSlide[];
  texts: OnboardingTexts;
};

type UseOnboardingDataReturn = {
  slides: OnboardingSlide[];
  texts: OnboardingTexts;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook to fetch onboarding slides and texts from API
 * Uses PROTECTED endpoint (API Key only, no JWT required)
 */
export const useOnboardingData = (): UseOnboardingDataReturn => {
  const { protectedGet } = useSecureApi();
  const [slides, setSlides] = useState<OnboardingSlide[]>([]);
  const [texts, setTexts] = useState<OnboardingTexts>({
    skip: { es: 'Omitir', en: 'Skip' },
    next: { es: 'Siguiente', en: 'Next' },
    start: { es: 'Empezar', en: 'Get Started' },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await protectedGet<OnboardingApiResponse>({
          endpoint: PROTECTED_ENDPOINTS.ONBOARDING.SLIDES,
          options: {
            timeout: 5000, // 5 seconds for JSON data
          },
        });

        if (response.error) {
          console.error('ERROR_FETCH_ONBOARDING', response.error);
          setError('Failed to load onboarding data');
          // Keep default data
          return;
        }

        if (response.data) {
          // Sort slides by order field
          const sortedSlides = response.data.slides.sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );

          // Transform API slides to add images
          const transformedSlides = sortedSlides.map((slide) => ({
            ...slide,
            // Use Supabase Storage URLs directly (no proxy needed)
            image: slide.imageUrl
              ? { uri: slide.imageUrl }
              : require('../../../../assets/icons/pop-auctioon-icon.png'),
          }));

          setSlides(transformedSlides);
          setTexts(response.data.texts);
        }
      } catch (err) {
        console.error('ERROR_FETCH_ONBOARDING_CATCH', err);
        setError('Unexpected error loading onboarding');
        // Keep default data
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingData();
  }, [protectedGet]);

  return {
    slides,
    texts,
    isLoading,
    error,
  };
};
