import React, { useMemo, useRef, useState } from 'react';
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
  initialIndex?: number;
  visibleCount?: 3 | 5;
  onIndexChange?: (index: number) => void;
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
  initialIndex = 0,
  visibleCount = 5,
  onIndexChange,
  radiusX = 90,
  radiusY = 140,
  itemSize = 56,
  arcStartDeg = -80,
  arcEndDeg = 80,
}: Props) => {
  const VISIBLE = visibleCount;
  const half = Math.floor(VISIBLE / 2);

  const [index, setIndex] = useState(() =>
    clamp(initialIndex, 0, Math.max(0, articles.length - 1))
  );

  // Drag amount (in "steps", where 1 step = move to next item)
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

  // How much finger movement corresponds to 1 item step
  const pixelsPerStep = 80;

  const setIndexSafe = (next: number) => {
    const clamped = clamp(next, 0, Math.max(0, articles.length - 1));
    setIndex(clamped);
    onIndexChange?.(clamped);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        // dy down => positive steps (go forward), dy up => negative (go backward)
        dragSteps.setValue(g.dy / pixelsPerStep);
      },
      onPanResponderRelease: (_, g) => {
        const raw = g.dy / pixelsPerStep;
        // snap to nearest integer step
        const snapped = Math.round(raw);

        // finite: clamp the move so we don't go past ends
        const next = clamp(index + snapped, 0, articles.length - 1);
        const applied = next - index;

        // update index
        if (applied !== 0) setIndexSafe(next);

        // animate drag back to 0 (wheel recenters)
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

  // Render offsets around current index: [-2..2]
  const slots = useMemo(() => {
    const arr: number[] = [];
    for (let o = -half; o <= half; o++) arr.push(o);
    return arr;
  }, [half]);

  // Container size: enough to show arc
  // Container size
  const PAD = 24;
  const W = radiusX * 2 + itemSize + PAD;
  const H = radiusY * 2 + itemSize + PAD;

  const cx = W - PAD; // circle center pushed to the right so arc stays near right edge
  const cy = H / 2;

  return (
    <View
      style={[styles.root, { width: W, height: H }]}
      {...panResponder.panHandlers}
    >
      {slots.map((offset) => {
        const itemIndex = index + offset;
        const isOut = itemIndex < 0 || itemIndex >= articles.length;
        const article = !isOut ? articles[itemIndex] : null;

        const slotIdx = offset + half; // 0..VISIBLE-1
        const theta0 = slotAngles[slotIdx]; // radians

        const x0 = cx - radiusX * Math.cos(theta0);
        const y0 = cy + radiusY * Math.sin(theta0);

        // While dragging, shift them up/down a bit to feel like rotation
        const dragY = Animated.multiply(dragSteps, 18); // tweak

        const scale = dragSteps.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [1, offset === 0 ? 1.05 : 1, 1],
          extrapolate: 'clamp',
        });

        const opacity = isOut ? 0 : offset === 0 ? 1 : 0.75;

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
            pointerEvents={offset === 0 ? 'auto' : 'none'}
          >
            {article ? (
              <Pressable
                onPress={() => {
                  // optional: tap center item
                }}
                style={[
                  styles.item,
                  { width: itemSize, height: itemSize, borderRadius: 14 },
                  offset === 0 && styles.itemActive,
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
  itemActive: {
    borderColor: 'rgba(215,86,57,0.9)',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
