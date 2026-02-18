import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

type OverlaySheetProps = {
  visible: boolean;
  onClose: () => void;
  bottomFreeAreaHeight: number;
  Z: {
    MODAL_ROOT: number;
    MODAL_BACKDROP: number;
    MODAL_CARD: number;
  };
  children: React.ReactNode;
};

export function OverlaySheet({
  visible,
  onClose,
  bottomFreeAreaHeight,
  Z,
  children,
}: OverlaySheetProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: Z.MODAL_ROOT, elevation: Z.MODAL_ROOT },
      ]}
      pointerEvents='box-none'
    >
      <Pressable
        onPress={onClose}
        style={[
          styles.backdrop,
          {
            bottom: bottomFreeAreaHeight,
            zIndex: Z.MODAL_BACKDROP,
            elevation: Z.MODAL_BACKDROP,
          },
        ]}
      />

      <View
        pointerEvents='box-none'
        style={[
          styles.contentWrapper,
          {
            bottom: bottomFreeAreaHeight,
            zIndex: Z.MODAL_CARD,
            elevation: Z.MODAL_CARD,
          },
        ]}
      >
        <View
          pointerEvents='auto'
          style={[
            styles.card,
            { zIndex: Z.MODAL_CARD, elevation: Z.MODAL_CARD },
          ]}
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
