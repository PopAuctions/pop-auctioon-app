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

  const stepAngle = useMemo(() => {
    // spread VISIBLE slots across the arc (finite half-circle)
    const totalDeg = arcEndDeg - arcStartDeg;
    return totalDeg / (VISIBLE - 1);
  }, [arcStartDeg, arcEndDeg, VISIBLE]);

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

        // θ for this slot, plus drag contribution.
        // dragSteps affects θ continuously so it "rotates" while dragging.
        const baseDeg = arcStartDeg + (offset + half) * stepAngle;

        // Convert dragSteps to degrees: 1 step == stepAngle degrees
        const theta = Animated.add(
          new Animated.Value(deg2rad(baseDeg)),
          Animated.multiply(dragSteps, deg2rad(stepAngle))
        );

        // x = cx + r*cos(θ), y = cy + r*sin(θ)
        // Animated doesn't have cos/sin, so we approximate by mapping a small discrete set
        // BUT for 5 items you can just precompute fixed positions and animate only "progress".
        //
        // To keep this sample simple and reliable, we do "discrete slots" + animated translateY
        // and a small scale/opacity effect. The wheel illusion still works well.

        // Position each slot at a fixed spot along the arc (precomputed with JS math)
        const theta0 = deg2rad(baseDeg);
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
