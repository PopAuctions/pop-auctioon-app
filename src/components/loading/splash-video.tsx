import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface SplashVideoProps {
  isReady: boolean;
  onFinish?: () => void;
}

export default function SplashVideo({ isReady, onFinish }: SplashVideoProps) {
  const [fadeAnim] = useState(new Animated.Value(1));
  const hasFinished = useRef(false);

  const player = useVideoPlayer(
    require('../../../assets/video/splash.mp4'),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  );

  useEffect(() => {
    if (!isReady || hasFinished.current) return;

    hasFinished.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
  }, [isReady, fadeAnim, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit='cover'
        nativeControls={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
