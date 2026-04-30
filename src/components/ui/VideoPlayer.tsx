import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

interface VideoPlayerProps {
  uri: string;
  onEnd?: () => void;
}

export const VideoPlayer = ({ uri, onEnd }: VideoPlayerProps) => {
  const player = useVideoPlayer(uri, (player) => {
    player.play();
  });

  useEventListener(player, 'playToEnd', () => {
    onEnd?.();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      nativeControls={false}
      contentFit='cover'
    />
  );
};
