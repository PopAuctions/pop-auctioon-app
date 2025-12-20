import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ArticleCountdown = ({
  finishTime,
  totalTicks = 10,
  onCountdownEnd,
}: {
  finishTime: string;
  totalTicks?: number;
  onCountdownEnd: () => void;
}) => {
  const [remainingMs, setRemainingMs] = useState(0);
  const [ended, setEnded] = useState(false);

  const endCalledRef = useRef(false);

  // Anim values
  const breathe = useRef(new Animated.Value(0)).current; // 0..1
  const fade = useRef(new Animated.Value(1)).current; // 1..0
  const rot = useRef(new Animated.Value(0)).current; // 0..1
  const drop = useRef(new Animated.Value(0)).current; // 0..1

  // derive "duration" from now -> finish
  const durationMs = useMemo(() => {
    const now = Date.now();
    const finish = new Date(finishTime).getTime();
    const remain = finish - now;
    return remain > 0 ? remain : 0;
  }, [finishTime]);

  const stepMs = useMemo(() => {
    if (totalTicks <= 0) return 0;
    return Math.max(1, Math.floor(durationMs / totalTicks));
  }, [durationMs, totalTicks]);

  const tickValue = useMemo(() => {
    if (durationMs <= 0) return 0;
    if (remainingMs <= 0) return 0;

    const v = Math.ceil(remainingMs / stepMs);
    return Math.min(totalTicks, Math.max(0, v));
  }, [durationMs, remainingMs, stepMs, totalTicks]);

  // reset on finishTime changes
  useEffect(() => {
    endCalledRef.current = false;
    setEnded(false);

    fade.setValue(1);
    rot.setValue(0);
    drop.setValue(0);

    const now = Date.now();
    const finish = new Date(finishTime).getTime();
    const remain = finish - now;
    setRemainingMs(remain > 0 ? remain : 0);
  }, [finishTime, fade, rot, drop]);

  // breathe like CSS (scale 1 -> 1.25 -> 1)
  useEffect(() => {
    if (durationMs <= 0 || ended) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [breathe, durationMs, ended]);

  // countdown timer updates remainingMs
  useEffect(() => {
    if (durationMs <= 0) return;

    let raf: number | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const update = () => {
      const now = Date.now();
      const finish = new Date(finishTime).getTime();
      const remain = finish - now;

      const next = remain > 0 ? remain : 0;
      setRemainingMs(next);

      if (next <= 0) setEnded(true);
    };

    timer = setInterval(update, 100);
    raf = requestAnimationFrame(update);

    return () => {
      if (timer) clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [durationMs, finishTime]);

  // end: call once + fade-out like CSS (opacity 0, scale 0.5, rotate 15deg, translateY 30)
  useEffect(() => {
    if (!ended) return;

    if (!endCalledRef.current) {
      endCalledRef.current = true;
      onCountdownEnd();
    }

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rot, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(drop, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [ended, fade, rot, drop, onCountdownEnd]);

  if (durationMs <= 0) return null;

  // show 0 briefly while fading
  if (ended && tickValue !== 0) return null;

  const breatheScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const endScale = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const rotateZ = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const translateY = drop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  return (
    <View
      pointerEvents='none'
      style={styles.container}
    >
      <Animated.View
        style={{
          opacity: fade,
          transform: ended
            ? [{ scale: endScale }, { rotateZ }, { translateY }]
            : [{ scale: breatheScale }],
        }}
      >
        <LinearGradient
          colors={['#ee4444', '#ffbbbb']} // #e44 -> #fbb
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.circle}
        >
          <Text
            style={styles.number}
            allowFontScaling={false}
            className='text-white'
          >
            {tickValue}
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const SIZE = 128;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -(SIZE / 2) }, { translateY: -(SIZE / 2) }],
    zIndex: 10,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: 9999,
    opacity: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 60,
    lineHeight: 66,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',

    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
});
