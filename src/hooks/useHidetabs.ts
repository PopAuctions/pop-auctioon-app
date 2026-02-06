import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export const useHideTabs = () => {
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const parent = navigation.getParent();
    if (!parent) return;

    parent.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      parent.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [navigation]);
};
