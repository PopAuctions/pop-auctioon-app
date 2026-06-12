import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RefreshScreen() {
  const router = useRouter();
  const { target } = useLocalSearchParams<{ target: string }>();

  useEffect(() => {
    if (target) {
      router.replace(target as any);
    }
  }, [target, router]);

  return <View />;
}
