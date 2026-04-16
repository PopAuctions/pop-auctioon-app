import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { CustomText } from './CustomText';

type InfoTooltipProps = {
  content?: string | React.ReactNode;
};

export function Tooltip({ content }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const isString = typeof content === 'string';

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        className='items-center justify-center rounded-full'
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

              {isString ? (
                <CustomText
                  type='body'
                  className='text-sm leading-snug text-black'
                >
                  {content}
                </CustomText>
              ) : (
                <View style={{ marginTop: 8 }}>{content}</View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
