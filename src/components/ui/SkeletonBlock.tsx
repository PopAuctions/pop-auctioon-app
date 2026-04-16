import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

export const SkeletonBlock = ({
  className,
  style,
  pulse = true,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
  pulse?: boolean;
}) => {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (!pulse) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [opacity, pulse]);

  return (
    <Animated.View
      style={[{ backgroundColor: '#E5E7EB', opacity }, style]}
      className={`rounded-xl ${className ?? ''}`}
    />
  );
};
