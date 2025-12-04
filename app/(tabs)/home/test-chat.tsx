import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chat } from '@/components/chat/Chat';
import { CustomText } from '@/components/ui/CustomText';

export default function TestChatScreen() {
  return (
    <SafeAreaView
      className='bg-gray-100 flex-1'
      edges={['top']}
    >
      <View className='flex-1 p-4'>
        <CustomText
          type='h2'
          className='mb-4'
        >
          Test Chat - AWS IVS
        </CustomText>

        <CustomText
          type='body'
          className='text-gray-600 mb-4'
        >
          Prueba de integración del chat en tiempo real
        </CustomText>

        <View className='h-[500px]'>
          <Chat
            auctionId='14'
            enabled={true}
            maxLength={500}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
