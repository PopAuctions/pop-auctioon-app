import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';
import { CustomArticleLiveAuto } from '@/types/types';

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

  // sample points along the ellipse arc
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

    const dx = x - prevX;
    const dy = y - prevY;
    total += Math.hypot(dx, dy);

    ts.push(t);
    lens.push(total);

    prevX = x;
    prevY = y;
  }

  // target lengths for each slot
  const out: number[] = [];
  for (let k = 0; k < count; k++) {
    const target = (total * k) / (count - 1);

    // find where cumulative length crosses target
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

    // linear interpolate between samples (good enough visually)
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

  useEffect(() => {
    setViewIndex(
      clamp(currentArticleIndex, 0, Math.max(0, articles.length - 1))
    );
  }, [currentArticleIndex, articles.length]);

  const dragSteps = useRef(new Animated.Value(0)).current;

  const slotAngles = useMemo(() => {
    return buildEqualArcAngles(
      arcStartDeg,
      arcEndDeg,
      VISIBLE,
      radiusX,
      radiusY
    );
  }, [arcStartDeg, arcEndDeg, VISIBLE, radiusX, radiusY]);

  const pixelsPerStep = 80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        dragSteps.setValue(g.dy / pixelsPerStep);
      },
      onPanResponderRelease: (_, g) => {
        const snapped = Math.round(g.dy / pixelsPerStep);
        const next = clamp(viewIndex - snapped, 0, articles.length - 1);

        if (next !== viewIndex) {
          setViewIndex(next);
          onViewIndexChange?.(next);
        }

        Animated.spring(dragSteps, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragSteps, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const slots = useMemo(() => {
    const arr: number[] = [];
    for (let o = -half; o <= half; o++) arr.push(o);
    return arr;
  }, [half]);

  const PAD = 24;
  const W = radiusX * 2 + itemSize + PAD;
  const H = radiusY * 2 + itemSize + PAD;

  const cx = W - PAD;
  const cy = H / 2;

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

        const slotIdx = offset + half;
        const theta0 = slotAngles[slotIdx];

        const x0 = cx - radiusX * Math.cos(theta0);
        const y0 = cy + radiusY * Math.sin(theta0);

        const dragY = Animated.multiply(dragSteps, 18);

        const scale = dragSteps.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [1, offset === 0 ? 1.05 : 1, 1],
          extrapolate: 'clamp',
        });

        const opacity = isOut ? 0 : isLive ? 1 : 0.75;

        return (
          <Animated.View
            key={offset}
            style={{
              position: 'absolute',
              left: x0 - itemSize / 2,
              top: y0 - itemSize / 2,
              transform: [{ translateY: dragY }, { scale }],
              opacity,
            }}
            pointerEvents={isOut ? 'none' : 'auto'}
          >
            {article ? (
              <Pressable
                onPress={() => {
                  // optional: maybe jump viewIndex to this itemIndex
                  // setViewIndex(itemIndex);
                }}
                style={[
                  styles.item,
                  { width: itemSize, height: itemSize, borderRadius: 14 },
                  isLive && styles.itemLive,
                ]}
              >
                <Image
                  source={{ uri: article?.images?.[0] ?? '' }}
                  style={styles.image}
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
