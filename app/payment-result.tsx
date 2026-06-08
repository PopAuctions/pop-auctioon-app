import { ActivityIndicator, View } from 'react-native';

export default function PaymentResultScreen() {
  // This route exists only to absorb the Redsys return deep link
  // so Expo Router does not briefly show the not-found screen.
  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <ActivityIndicator
        size='large'
        color='#d75639'
      />
    </View>
  );
}
