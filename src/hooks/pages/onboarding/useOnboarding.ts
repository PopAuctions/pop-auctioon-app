import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/onboarding';

/**
 * Hook to manage onboarding state.
 *
 * Provides:
 * - `resetOnboarding`: clears the persisted onboarding flag and navigates back to the onboarding flow,
 *   useful for testing or allowing users to view onboarding again.
 * - `hasSeenOnboarding`: checks whether the user has previously completed onboarding.
 */
export const useOnboarding = () => {
  const router = useRouter();

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(HAS_SEEN_ONBOARDING_KEY);
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const hasSeenOnboarding = async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // On error, default to false so onboarding is shown rather than silently skipped
      return false;
    }
  };

  return {
    resetOnboarding,
    hasSeenOnboarding,
  };
};
