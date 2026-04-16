import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

interface VideoPlayerProps {
  uri: string;
}

export const VideoPlayer = ({ uri }: VideoPlayerProps) => {
  const player = useVideoPlayer(uri, (player) => {
    player.play();
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
