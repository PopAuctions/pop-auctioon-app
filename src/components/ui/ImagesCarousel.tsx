import { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  StyleSheet,
} from 'react-native';
import { CustomText } from './CustomText';

export function ImagesCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / containerWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
  }, []);

  return (
    <View
      className='w-full items-center md:max-w-[650px]'
      onLayout={handleLayout}
    >
      {containerWidth > 0 && (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            bounces={false}
            decelerationRate='fast'
            snapToInterval={containerWidth}
            snapToAlignment='center'
          >
            {images.map((img, idx) => (
              <View
                key={idx}
                style={[styles.slide, { width: containerWidth }]}
              >
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.image,
                    {
                      width: containerWidth,
                      height: containerWidth,
                    },
                  ]}
                />
              </View>
            ))}
          </ScrollView>

          <View className='mt-1 flex-row'>
            {images.map((_, idx) => (
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
              {activeIndex + 1} / {images.length}
            </CustomText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
