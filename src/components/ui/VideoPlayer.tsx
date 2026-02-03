import { Video, ResizeMode } from 'expo-av';
import { StyleSheet } from 'react-native';

interface VideoPlayerProps {
  uri: string;
}

export const VideoPlayer = ({ uri }: VideoPlayerProps) => {
  return (
    <Video
      source={{ uri }}
      style={StyleSheet.absoluteFillObject}
      isLooping
      isMuted
      shouldPlay
      resizeMode={ResizeMode.COVER}
    />
  );
};
