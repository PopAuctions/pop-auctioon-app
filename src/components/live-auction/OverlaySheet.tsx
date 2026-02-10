import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

type OverlaySheetProps = {
  visible: boolean;
  onClose: () => void;
  bottomFreeAreaHeight: number;
  children: React.ReactNode;
};

export function OverlaySheet({
  visible,
  onClose,
  bottomFreeAreaHeight,
  children,
}: OverlaySheetProps) {
  if (!visible) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents='box-none'
    >
      <Pressable
        onPress={onClose}
        style={[styles.backdrop, { bottom: bottomFreeAreaHeight }]}
      />

      <View
        pointerEvents='box-none'
        style={[styles.contentWrapper, { bottom: bottomFreeAreaHeight }]}
      >
        <View
          pointerEvents='auto'
          style={styles.card}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  contentWrapper: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
