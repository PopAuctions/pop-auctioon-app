import { useState, useEffect } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import type { OnboardingVideo } from '@/types/types';

type OnboardingApiResponse = {
  videos: OnboardingVideo;
};

type UseOnboardingDataReturn = {
  videosData: OnboardingVideo | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook to fetch onboarding slides and texts from API
 * Uses PROTECTED endpoint (API Key only, no JWT required)
 */
export const useOnboardingData = (): UseOnboardingDataReturn => {
  const { protectedGet } = useSecureApi();
  const [videosData, setVideosData] = useState<OnboardingVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await protectedGet<OnboardingApiResponse>({
          endpoint: PROTECTED_ENDPOINTS.ONBOARDING,
          options: {
            timeout: 5000,
          },
        });

        if (response.error) {
          console.error('ERROR_FETCH_ONBOARDING', response.error);
          setError('Failed to load onboarding data');
          // Keep default data
          return;
        }

        if (response.data) {
          setVideosData(response.data.videos ?? null);
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
    videosData,
    isLoading,
    error,
  };
};
