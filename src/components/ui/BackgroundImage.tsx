import React from 'react';
import { ImageBackground, View, ImageSourcePropType } from 'react-native';

interface BackgroundImageProps {
  children: React.ReactNode;
  source: ImageSourcePropType | string;
  overlay?: boolean;
  overlayOpacity?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  className?: string;
  style?: any;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  children,
  source,
  overlay = true,
  overlayOpacity = 0,
  resizeMode = 'cover',
  className = 'flex-1',
  style,
}) => {
  // Determinar si es una ruta de string o un require()
  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <ImageBackground
      source={imageSource}
      className={className}
      resizeMode={resizeMode}
      style={style}
    >
      {overlay && (
        <View
          className='absolute inset-0'
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        />
      )}
      {children}
    </ImageBackground>
  );
};
