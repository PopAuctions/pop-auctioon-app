import { Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LiveBackButton = ({
  onPress,
  controlsVisible,
  controlsOpacity,
  insetsTop,
  UI,
  Z,
}: {
  onPress: () => void;
  controlsVisible: boolean;
  controlsOpacity: Animated.Value;
  insetsTop: number;
  UI: {
    SCREEN_PADDING: number;
    BACK_TOP_GAP: number;
    BACK_SIZE: number;
  };
  Z: {
    BACK: number;
  };
}) => {
  return (
    <Animated.View
      pointerEvents={controlsVisible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        left: UI.SCREEN_PADDING,
        top: insetsTop + UI.BACK_TOP_GAP,
        opacity: controlsOpacity,
        zIndex: Z.BACK,
        elevation: Z.BACK,
        transform: [
          {
            translateY: controlsOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-8, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          height: UI.BACK_SIZE,
          width: UI.BACK_SIZE,
          borderRadius: UI.BACK_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <Ionicons
          name='arrow-back'
          size={24}
          color='white'
        />
      </TouchableOpacity>
    </Animated.View>
  );
};
