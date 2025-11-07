import { View, Text, Modal, Pressable } from 'react-native';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { Divider } from '../ui/Divider';

type PriceBreakdownModalProps = {
  visible: boolean;
  onClose: () => void;
  texts: {
    price: string;
    commission: string;
    shipping: string;
  };
  priceFormatted: string;
  commissionFeeFormatted: string;
  commissionedPriceFormatted: string;
};

export function PriceBreakdownModal({
  visible,
  onClose,
  texts,
  priceFormatted,
  commissionFeeFormatted,
  commissionedPriceFormatted,
}: PriceBreakdownModalProps) {
  return (
    <Modal
      animationType='fade'
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-black/40'>
        <Pressable
          className='absolute inset-0'
          onPress={onClose}
        />

        {/* Centered card */}
        <View className='flex-1 items-center justify-center px-6'>
          <View className='w-full max-w-[340px] rounded-xl bg-white p-2 pb-4 shadow-lg'>
            <View className='items-end'>
              <Pressable
                onPress={onClose}
                hitSlop={16}
              >
                <FontAwesomeIcon
                  variant='bold'
                  name='close'
                  size={15}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            <View className='mt-2 flex-row justify-between'>
              <Text className='mr-2 text-sm'>{texts.price}:</Text>
              <Text className='text-sm'>{priceFormatted}</Text>
            </View>

            <View className='mt-1 flex-row justify-between'>
              <Text className='mr-2 text-sm'>{texts.commission}:</Text>
              <Text className='text-sm'>{commissionFeeFormatted}</Text>
            </View>

            <Divider className='my-2' />

            <View className='flex-row justify-between'>
              <Text className='mr-2 text-sm font-bold'>Total:</Text>
              <Text className='text-sm font-bold'>
                {commissionedPriceFormatted}
              </Text>
            </View>

            <Text className='mt-3 text-[11px]'>{texts.shipping}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
