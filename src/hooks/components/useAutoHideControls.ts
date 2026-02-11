import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

interface Params {
  fadeMs: number;
  slideMs: number;
  autoHideMs: number;
  topControlsHeight: number;
  paused: boolean;
}

export function useAutoHideControls({
  fadeMs,
  slideMs,
  autoHideMs,
  topControlsHeight,
  paused,
}: Params) {
  const [visible, setVisible] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hudOffsetY = useRef(new Animated.Value(0)).current;

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const animate = useCallback(
    (show: boolean) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: show ? 1 : 0,
          duration: fadeMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(hudOffsetY, {
          toValue: show ? topControlsHeight : 0,
          duration: slideMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [fadeMs, slideMs, topControlsHeight, opacity, hudOffsetY]
  );

  const armAutoHide = useCallback(() => {
    clearTimer();
    hideTimerRef.current = setTimeout(() => {
      if (paused) return;
      setVisible(false);
      animate(false);
    }, autoHideMs);
  }, [animate, autoHideMs, clearTimer, paused]);

  const show = useCallback(() => {
    if (visible) {
      armAutoHide();
      return;
    }
    setVisible(true);
    animate(true);
    armAutoHide();
  }, [animate, armAutoHide, visible]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
    animate(false);
  }, [animate, clearTimer]);

  useEffect(() => {
    setVisible(true);
    animate(true);
    armAutoHide();

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    visible,
    opacity,
    hudOffsetY,
    show,
    hide,
    clearTimer,
  };
}
