import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { HAS_SEEN_ONBOARDING_KEY } from '@/constants/onboarding';

/**
 * Hook to reset onboarding state
 * Useful for testing or allowing users to view onboarding again
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
      return true; // Default to true on error
    }
  };

  return {
    resetOnboarding,
    hasSeenOnboarding,
  };
};
