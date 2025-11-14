import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { FontAwesomeIcon } from './FontAwesomeIcon';

type InfoTooltipProps = {
  text: string;
};

export function Tooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        className='items-center justify-center rounded-full bg-black/5'
        testID='tooltip-pressable'
      >
        <FontAwesomeIcon
          name='info-circle'
          size={14}
          color='cinnabar'
        />
      </Pressable>

      <Modal
        animationType='fade'
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        {/* dark overlay */}
        <View className='flex-1 bg-black/40'>
          {/* tap outside to close */}
          <Pressable
            className='absolute inset-0'
            onPress={() => setOpen(false)}
          />

          {/* centered card */}
          <View className='flex-1 items-center justify-center px-6'>
            <View className='w-full max-w-[340px] rounded-xl bg-white p-4 shadow-lg'>
              <View className='items-end'>
                <Pressable
                  hitSlop={16}
                  onPress={() => setOpen(false)}
                >
                  <FontAwesomeIcon
                    variant='bold'
                    name='close'
                    size={15}
                    color='cinnabar'
                  />
                </Pressable>
              </View>

              <Text className='text-sm leading-snug text-black'>{text}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
