import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomText } from './CustomText';

export function ImagesCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const scrollRef = useRef<any>(null);
  const viewerListRef = useRef<FlatList<string>>(null);

  const { width: winW, height: winH } = useWindowDimensions();

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / containerWidth);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
    requestAnimationFrame(() => {
      viewerListRef.current?.scrollToIndex({ index, animated: false });
    });
  }, []);

  const closeViewer = useCallback(() => setViewerOpen(false), []);

  const onViewerScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const newIndex = Math.round(x / winW);
      if (newIndex !== viewerIndex) setViewerIndex(newIndex);
    },
    [winW, viewerIndex]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: winW,
      offset: winW * index,
      index,
    }),
    [winW]
  );

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  if (safeImages.length === 0) return null;

  return (
    <>
      <View
        className='w-full items-center md:max-w-[650px]'
        onLayout={handleLayout}
      >
        {containerWidth > 0 && (
          <>
            <FlatList
              ref={scrollRef}
              data={safeImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, idx) => String(idx)}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
              decelerationRate='fast'
              snapToInterval={containerWidth}
              snapToAlignment='center'
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => openViewer(index)}
                  style={[styles.slide, { width: containerWidth }]}
                >
                  <Image
                    source={{ uri: item }}
                    style={[
                      styles.image,
                      { width: containerWidth, height: containerWidth },
                    ]}
                  />
                </Pressable>
              )}
            />

            <View className='mt-1 flex-row'>
              {safeImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: idx === activeIndex ? '#d75639' : '#ccc',
                    },
                  ]}
                />
              ))}
            </View>

            <View className='absolute bottom-5 right-2 rounded-full bg-black/60 px-3 py-1'>
              <CustomText
                type='body'
                className='text-xs text-white'
              >
                {activeIndex + 1} / {safeImages.length}
              </CustomText>
            </View>
          </>
        )}
      </View>

      {/* Fullscreen viewer */}
      <Modal
        visible={viewerOpen}
        transparent
        animationType='fade'
        onRequestClose={closeViewer}
        statusBarTranslucent
      >
        <View style={styles.viewerRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeViewer}
          />

          {/* Images */}
          <FlatList
            ref={viewerListRef}
            data={safeImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => `viewer-${idx}`}
            getItemLayout={getItemLayout}
            initialScrollIndex={viewerIndex}
            onMomentumScrollEnd={onViewerScrollEnd}
            renderItem={({ item }) => (
              <View style={[styles.viewerSlide, { width: winW, height: winH }]}>
                <Image
                  source={{ uri: item }}
                  style={[styles.viewerImage, { width: winW, height: winH }]}
                />
              </View>
            )}
          />

          {/* Top bar */}
          <View
            style={styles.viewerTopBar}
            pointerEvents='box-none'
          >
            <Pressable
              style={styles.closeBtn}
              onPress={closeViewer}
            >
              <Ionicons
                name='close'
                size={26}
                color='white'
              />
            </Pressable>

            <View style={styles.counter}>
              <CustomText
                type='body'
                className='text-xs text-white'
              >
                {viewerIndex + 1} / {safeImages.length}
              </CustomText>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  slide: { justifyContent: 'center', alignItems: 'center' },
  image: {
    resizeMode: 'cover',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },

  // Viewer
  viewerRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  viewerSlide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    resizeMode: 'contain',
  },
  viewerTopBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 28 : 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  closeBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
