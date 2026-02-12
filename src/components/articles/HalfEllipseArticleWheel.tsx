import { CustomArticleLiveAuto } from '@/types/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

interface Props {
  articles: CustomArticleLiveAuto[];
  currentArticleIndex: number;
  visibleCount?: 3 | 5;
  onViewIndexChange?: (index: number) => void;
  radiusX?: number;
  radiusY?: number;
  itemSize?: number;
  arcStartDeg?: number;
  arcEndDeg?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const normalizeSteps = (raw: number) => {
  let whole = Math.trunc(raw);
  let frac = raw - whole; // (-1..1)

  // If user crosses half a step, advance early
  if (frac > 0.5) {
    whole += 1;
    frac -= 1;
  } else if (frac < -0.5) {
    whole -= 1;
    frac += 1;
  }

  return { whole, frac }; // frac is now in [-0.5..0.5]
};

const buildEqualArcAngles = (
  startDeg: number,
  endDeg: number,
  count: number,
  rx: number,
  ry: number,
  samples = 400
) => {
  const start = deg2rad(startDeg);
  const end = deg2rad(endDeg);

  const ts: number[] = [];
  const lens: number[] = [];

  let total = 0;
  let prevX = rx * Math.cos(start);
  let prevY = ry * Math.sin(start);

  ts.push(start);
  lens.push(0);

  for (let i = 1; i <= samples; i++) {
    const t = start + ((end - start) * i) / samples;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);

    total += Math.hypot(x - prevX, y - prevY);

    ts.push(t);
    lens.push(total);

    prevX = x;
    prevY = y;
  }

  const out: number[] = [];
  for (let k = 0; k < count; k++) {
    const target = (total * k) / (count - 1);

    let j = 0;
    while (j < lens.length && lens[j] < target) j++;

    if (j === 0) {
      out.push(ts[0]);
      continue;
    }
    if (j >= lens.length) {
      out.push(ts[ts.length - 1]);
      continue;
    }

    const l0 = lens[j - 1];
    const l1 = lens[j];
    const t0 = ts[j - 1];
    const t1 = ts[j];
    const a = (target - l0) / (l1 - l0 || 1);

    out.push(t0 + (t1 - t0) * a);
  }

  return out; // radians
};

export const HalfEllipseArticleWheel = ({
  articles,
  currentArticleIndex,
  visibleCount = 5,
  onViewIndexChange,
  radiusX = 90,
  radiusY = 140,
  itemSize = 56,
  arcStartDeg = -80,
  arcEndDeg = 80,
}: Props) => {
  const VISIBLE = visibleCount;
  const half = Math.floor(VISIBLE / 2);

  const [viewIndex, setViewIndex] = useState(() =>
    clamp(currentArticleIndex, 0, Math.max(0, articles.length - 1))
  );

  const viewIndexRef = useRef(viewIndex);
  useEffect(() => {
    viewIndexRef.current = viewIndex;
  }, [viewIndex]);

  // When auction changes article, recenter wheel on it.
  useEffect(() => {
    setViewIndex(
      clamp(currentArticleIndex, 0, Math.max(0, articles.length - 1))
    );
  }, [currentArticleIndex, articles.length]);

  // Continuous progress in [-1..1] (always max one step)
  const dragProgress = useRef(new Animated.Value(0)).current;

  const pixelsPerStep = 110; // tune (bigger = needs more finger move)
  const snapThreshold = 0.28; // tune (smaller = easier to switch)

  const slotAngles = useMemo(
    () =>
      buildEqualArcAngles(arcStartDeg, arcEndDeg, VISIBLE, radiusX, radiusY),
    [arcStartDeg, arcEndDeg, VISIBLE, radiusX, radiusY]
  );

  // Precompute ellipse positions for each visible slot
  const PAD = 24;
  const W = radiusX * 2 + itemSize + PAD;
  const H = radiusY * 2 + itemSize + PAD;
  const cx = W - PAD;
  const cy = H / 2;

  const slotPos = useMemo(() => {
    return slotAngles.map((t) => {
      const x = cx - radiusX * Math.cos(t);
      const y = cy + radiusY * Math.sin(t);
      return { x, y };
    });
  }, [slotAngles, cx, cy, radiusX, radiusY]);

  const slots = useMemo(() => {
    const arr: number[] = [];
    for (let o = -half; o <= half; o++) arr.push(o);
    return arr;
  }, [half]);

  const startIndexRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),

      onPanResponderGrant: () => {
        // capture where the window starts for THIS gesture
        startIndexRef.current = viewIndexRef.current;
        dragProgress.setValue(0);
      },

      onPanResponderMove: (_, g) => {
        const raw = g.dy / pixelsPerStep;
        const { whole, frac } = normalizeSteps(raw);

        // dy+ (down) => viewIndex should move DOWN visually => decrease index (your chosen mapping)
        const base = clamp(
          startIndexRef.current - whole,
          0,
          articles.length - 1
        );

        if (base !== viewIndexRef.current) {
          viewIndexRef.current = base;
          setViewIndex(base);
          onViewIndexChange?.(base);
        }

        dragProgress.setValue(frac);
      },

      onPanResponderRelease: (_, g) => {
        const raw = g.dy / pixelsPerStep;
        const { whole, frac } = normalizeSteps(raw);

        const base = clamp(
          startIndexRef.current - whole,
          0,
          articles.length - 1
        );

        // snap using remaining frac (now only -0.5..0.5)
        const snapThreshold = 0.25; // tweak
        let snap = 0;
        if (frac > snapThreshold) snap = -1;
        else if (frac < -snapThreshold) snap = 1;

        const next = clamp(base + snap, 0, articles.length - 1);

        viewIndexRef.current = next;
        setViewIndex(next);
        onViewIndexChange?.(next);

        Animated.spring(dragProgress, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(dragProgress, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const from = Math.max(0, viewIndex - (half + 3));
    const to = Math.min(articles.length - 1, viewIndex + (half + 3));

    for (let i = from; i <= to; i++) {
      const uri = articles[i]?.images?.[0];
      if (uri) Image.prefetch(uri);
    }
  }, [viewIndex, articles, half]);

  return (
    <View
      style={[styles.root, { width: W, height: H }]}
      {...panResponder.panHandlers}
    >
      {slots.map((offset) => {
        const itemIndex = viewIndex + offset;
        const isOut = itemIndex < 0 || itemIndex >= articles.length;
        const article = !isOut ? articles[itemIndex] : null;

        const isLive = itemIndex === currentArticleIndex;

        const slotIdx = offset + half; // 0..VISIBLE-1

        // Neighbors inside the VISIBLE slots (for interpolation)
        const upIdx = clamp(slotIdx - 1, 0, VISIBLE - 1);
        const downIdx = clamp(slotIdx + 1, 0, VISIBLE - 1);

        const up = slotPos[upIdx];
        const cur = slotPos[slotIdx];
        const down = slotPos[downIdx];

        // Interpolate position for continuous rotation:
        // progress -1 => toward "up" neighbor
        // progress  0 => current
        // progress +1 => toward "down" neighbor
        const tx = dragProgress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [
            up.x - itemSize / 2,
            cur.x - itemSize / 2,
            down.x - itemSize / 2,
          ],
          extrapolate: 'clamp',
        });

        const ty = dragProgress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [
            up.y - itemSize / 2,
            cur.y - itemSize / 2,
            down.y - itemSize / 2,
          ],
          extrapolate: 'clamp',
        });

        const scale = dragProgress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [1, offset === 0 ? 1.05 : 1, 1],
          extrapolate: 'clamp',
        });

        const opacity = isOut ? 0 : isLive ? 1 : 0.75;

        return (
          <Animated.View
            key={itemIndex}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              opacity,
              transform: [{ translateX: tx }, { translateY: ty }, { scale }],
            }}
            pointerEvents={isOut ? 'none' : 'auto'}
          >
            {article ? (
              <Pressable
                style={[
                  styles.item,
                  { width: itemSize, height: itemSize, borderRadius: 14 },
                  isLive && styles.itemLive,
                ]}
              >
                <Image
                  source={{ uri: article?.images?.[0] ?? '' }}
                  style={styles.image}
                  fadeDuration={0} // Android: prevents the “flash”
                />
              </Pressable>
            ) : (
              <View style={{ width: itemSize, height: itemSize }} />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'visible',
  },
  item: {
    overflow: 'hidden',
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  itemLive: {
    borderColor: 'rgba(215,86,57,0.9)',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
