import { CustomArticleLiveAuto } from '@/types/types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Image,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

interface Props {
  articles: CustomArticleLiveAuto[];
  currentArticleIndex: number;
  visibleCount?: 3 | 5;

  onViewIndexChange?: (index: number) => void;
  onArticlePress?: (id: number) => void;
  radiusX?: number;
  radiusY?: number;
  itemSize?: number;
  arcStartDeg?: number;
  arcEndDeg?: number;

  pixelsPerStep?: number; // how much finger movement = 1 index
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

    if (j === 0) out.push(ts[0]);
    else if (j >= lens.length) out.push(ts[ts.length - 1]);
    else {
      const l0 = lens[j - 1];
      const l1 = lens[j];
      const t0 = ts[j - 1];
      const t1 = ts[j];
      const a = (target - l0) / (l1 - l0 || 1);
      out.push(t0 + (t1 - t0) * a);
    }
  }

  return out;
};

export const HalfEllipseArticleWheel = ({
  articles,
  currentArticleIndex,
  visibleCount = 5,
  onViewIndexChange,
  onArticlePress,
  radiusX = 90,
  radiusY = 140,
  itemSize = 56,
  arcStartDeg = -80,
  arcEndDeg = 80,
  pixelsPerStep = 180,
}: Props) => {
  const len = articles.length;
  const VISIBLE = visibleCount;
  const half = Math.floor(VISIBLE / 2);
  const [centerValue, setCenterValue] = useState(() =>
    clamp(currentArticleIndex, 0, Math.max(0, len - 1))
  );
  const [snappedCenter, setSnappedCenter] = useState(() =>
    clamp(currentArticleIndex, 0, Math.max(0, len - 1))
  );
  const isDraggingRef = useRef(false);
  const pendingLiveIndexRef = useRef<number | null>(null);
  const snappedCenterRef = useRef(snappedCenter);
  const center = useRef(
    new Animated.Value(clamp(currentArticleIndex, 0, Math.max(0, len - 1)))
  ).current;
  const centerRef = useRef(centerValue);
  const startCenterRef = useRef(0);

  const slotAngles = useMemo(() => {
    return buildEqualArcAngles(
      arcStartDeg,
      arcEndDeg,
      VISIBLE,
      radiusX,
      radiusY
    );
  }, [arcStartDeg, arcEndDeg, VISIBLE, radiusX, radiusY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),

      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        pendingLiveIndexRef.current = null;

        center.stopAnimation();
        startCenterRef.current = centerRef.current;
      },

      onPanResponderMove: (_, g) => {
        const next = clamp(
          startCenterRef.current - g.dy / pixelsPerStep,
          0,
          Math.max(0, len - 1)
        );

        center.setValue(next);
      },

      onPanResponderRelease: () => {
        const raw = centerRef.current;
        const snapped = clamp(Math.round(raw), 0, Math.max(0, len - 1));

        Animated.spring(center, {
          toValue: snapped,
          useNativeDriver: false,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
        }).start(() => {
          isDraggingRef.current = false;
          setSnappedCenter(snapped);
          onViewIndexChange?.(snapped);

          if (pendingLiveIndexRef.current != null) {
            const target = pendingLiveIndexRef.current;
            pendingLiveIndexRef.current = null;
            animateToLive(target);
          }
        });
      },

      onPanResponderTerminate: () => {
        const raw = centerRef.current;
        const snapped = clamp(Math.round(raw), 0, Math.max(0, len - 1));
        Animated.spring(center, {
          toValue: snapped,
          useNativeDriver: false,
        }).start(() => {
          isDraggingRef.current = false;
          setSnappedCenter(snapped);
          onViewIndexChange?.(snapped);

          if (pendingLiveIndexRef.current != null) {
            const target = pendingLiveIndexRef.current;
            pendingLiveIndexRef.current = null;
            animateToLive(target);
          }
        });
      },
    })
  ).current;

  const animateToLive = useCallback(
    (targetIndex: number) => {
      const target = clamp(targetIndex, 0, Math.max(0, len - 1));

      setSnappedCenter(target);
      snappedCenterRef.current = target;

      center.stopAnimation();

      Animated.timing(center, {
        toValue: target,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        isDraggingRef.current = false;
      });
    },
    [center, setSnappedCenter, snappedCenterRef, len]
  );

  // Map a continuous slot position (0..VISIBLE-1) to an angle by interpolating `slotAngles`.
  const thetaAt = (pos: number) => {
    // allow a tiny extrapolation so ends feel smoother
    const p = clamp(pos, -0.35, VISIBLE - 1 + 0.35);
    const i0 = Math.floor(p);
    const i1 = i0 + 1;
    const t = p - i0;

    const a0 = slotAngles[clamp(i0, 0, VISIBLE - 1)];
    const a1 = slotAngles[clamp(i1, 0, VISIBLE - 1)];
    return lerp(a0, a1, t);
  };

  const PAD = 24;
  const W = radiusX * 2 + itemSize + PAD;
  const H = radiusY * 2 + itemSize + PAD;
  const cx = W - PAD;
  const cy = H / 2;
  const buffer = 2;
  const centerInt = Math.round(centerValue);
  const startIdx = clamp(centerInt - half - buffer, 0, Math.max(0, len - 1));
  const endIdx = clamp(centerInt + half + buffer, 0, Math.max(0, len - 1));

  const indicesToRender = useMemo(() => {
    const arr: number[] = [];
    for (let i = startIdx; i <= endIdx; i++) arr.push(i);
    return arr;
  }, [startIdx, endIdx]);

  useEffect(() => {
    const sub = center.addListener(({ value }) => {
      centerRef.current = value;
      setCenterValue(value);
    });
    return () => center.removeListener(sub);
  }, [center]);

  useEffect(
    () => void (snappedCenterRef.current = snappedCenter),
    [snappedCenter]
  );

  // When auction changes live article, we snap wheel center to it (no drag).
  useEffect(() => {
    const next = clamp(currentArticleIndex, 0, Math.max(0, len - 1));

    if (isDraggingRef.current) {
      pendingLiveIndexRef.current = next;
      return;
    }

    animateToLive(next);
  }, [currentArticleIndex, len, animateToLive]);

  return (
    <View
      style={[styles.root, { width: W, height: H }]}
      {...panResponder.panHandlers}
    >
      {indicesToRender.map((itemIndex) => {
        const article = articles[itemIndex];
        if (!article) return null;
        const articleId = article.id;

        // Relative position of this item to the center (float).
        // rel = 0 -> center, rel = -1 above, rel = +1 below
        const rel = itemIndex - centerValue;

        // Convert rel to a continuous slot position
        const slotPos = half + rel;

        // Cull far-away items (keep a bit extra so fade looks clean)
        if (slotPos < -1.2 || slotPos > VISIBLE + 0.2) return null;

        const isLive = itemIndex === currentArticleIndex;
        const relToSnapped = itemIndex - snappedCenter;
        const slotPosSnapped = half + relToSnapped;

        const isInVisibleSlots =
          slotPosSnapped >= 0 && slotPosSnapped <= VISIBLE - 1;
        const showLiveBorder = isLive && isInVisibleSlots;
        const theta = thetaAt(slotPos);

        const x0 = cx - radiusX * Math.cos(theta);
        const y0 = cy + radiusY * Math.sin(theta);

        // Fade as it approaches ends
        const dist = Math.abs(rel);
        const z = 1000 - Math.round(dist * 100) + Math.round(y0);

        return (
          <View
            key={`article-${articleId ?? itemIndex}`}
            style={{
              position: 'absolute',
              left: x0 - itemSize / 2,
              top: y0 - itemSize / 2,
              zIndex: z,
              elevation: z,
            }}
            pointerEvents='auto'
          >
            <Pressable
              style={[
                styles.item,
                { width: itemSize, height: itemSize, borderRadius: 14 },
                showLiveBorder && styles.itemLive,
              ]}
              onPress={() => {
                if (isDraggingRef.current) return;
                onArticlePress?.(articleId);
              }}
            >
              <Image
                source={{ uri: article.images?.[0] ?? '' }}
                style={[
                  styles.image,
                  { opacity: article?.ArticleBid?.available ? 1 : 0.4 },
                ]}
              />
            </Pressable>
          </View>
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
    borderColor: '#d75639',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
