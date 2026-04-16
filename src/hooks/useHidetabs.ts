import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

export const useHideTabs = () => {
  const navigation = useNavigation();

  useEffect(() => {
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
