import React, { useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { Animated } from 'react-native';

interface SplashLottieProps {
  onAnimationFinish?: () => void;
}

export default function SplashLottie({ onAnimationFinish }: SplashLottieProps) {
  const [fadeAnim] = useState(new Animated.Value(1));
  const hasFinished = useRef(false);

  const handleAnimationFinish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;

    // Fade-out suave para transición fluida
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onAnimationFinish?.();
    });
  };

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: 'white', opacity: fadeAnim }}
    >
      <LottieView
        source={require('../../../assets/lottie/loading-bubbles.json')}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
        style={{ flex: 1 }}
        speed={1.2}
      />
    </Animated.View>
  );
}
