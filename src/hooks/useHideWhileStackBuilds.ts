import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

/**
 * Prevents the flash of an index screen during cross-stack navigation.
 *
 * useAuthNavigation (and onboarding) pass hideContent='true' when they do
 * replace(parent) + push(child). This hook hides the screen on that first
 * render, then reveals it after the push completes — so the user never sees
 * the intermediate index screen.
 *
 * Add to any stack index screen that can be a cross-stack navigation target:
 *   const shouldHide = useHideWhileStackBuilds();
 *   if (shouldHide) return <View className='flex-1 bg-white' />;
 */
export const useHideWhileStackBuilds = (): boolean => {
  const { hideContent } = useLocalSearchParams<{ hideContent?: string }>();

  // Read param only on mount — local state owns visibility from here on
  const [shouldHide, setShouldHide] = useState(hideContent === 'true');

  useEffect(() => {
    if (!shouldHide) return;
    // The push happens in setTimeout(0); reveal after that completes
    const timer = setTimeout(() => setShouldHide(false), 50);
    return () => clearTimeout(timer);
  }, [shouldHide]);

  return shouldHide;
};
