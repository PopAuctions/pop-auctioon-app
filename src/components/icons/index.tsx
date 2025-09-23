import React from 'react';
import { Image, View } from 'react-native';

export const PopAuctioonIcon = ({
  className = '',
  centered = false,
}: {
  className?: string;
  centered?: boolean;
}) => (
  <View
    className={`${centered ? 'items-center justify-center' : ''} ${className}`}
  >
    <Image
      source={require('./logo.png')}
      className='h-full w-full'
      resizeMode='contain'
      style={{
        tintColor: '#000000',
      }}
    />
  </View>
);
