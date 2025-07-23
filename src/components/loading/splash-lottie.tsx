import React from 'react';
import LottieView from 'lottie-react-native';

export default function SplashLottie() {
  return (
    <LottieView
      source={require('../../../assets/lottie/loading-bubbles.json')} // tu archivo Lottie
      autoPlay
      loop
      style={{ flex: 1 }}
    />
  );
}
