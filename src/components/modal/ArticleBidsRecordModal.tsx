import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '../ui/FontAwesomeIcon';
import { euroFormatter } from '@/utils/euroFormatter';
import { Bids, Lang } from '@/types/types';
import { useMemo } from 'react';
import { CustomText } from '../ui/CustomText';
import { Loading } from '../ui/Loading';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { CustomImage } from '../ui/CustomImage';

type ArticleBidsRecordModalProps = {
  visible: boolean;
  onClose: () => void;
  lang: Lang;
  initialPrice: number;
  texts: {
    title: string;
    initialPrice: string;
    noBidsYet: string;
  };
  bids: Bids[];
  isLoading: boolean;
};

export const ArticleBidsRecordModal = ({
  visible,
  onClose,
  initialPrice,
  lang,
  texts,
  bids,
  isLoading,
}: ArticleBidsRecordModalProps) => {
  const formatter = useMemo(() => euroFormatter(lang), [lang]);

  const commissionedPrice = getArticleCommissionedPrice(
    initialPrice ?? 0,
    LOW_COMMISSION_AMOUNT
  );

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
                  size={20}
                  color='cinnabar'
                />
              </Pressable>
            </View>

            <View className='flex flex-col items-center justify-center'>
              <CustomText
                className='text-center'
                type='h2'
              >
                {texts.title}
              </CustomText>
              <CustomText
                className='text-center text-lg'
                type='body'
              >
                {texts.initialPrice}: {formatter.format(commissionedPrice)}
              </CustomText>

              {isLoading ? (
                <View className='mt-4 h-48 w-full items-center justify-center'>
                  <Loading locale={lang} />
                </View>
              ) : (
                <>
                  {bids.length === 0 ? (
                    <View className='mt-4 max-h-48 w-full rounded-xl border-2 border-cinnabar p-4'>
                      <CustomText
                        className='text-center text-lg'
                        type='body'
                      >
                        {texts.noBidsYet}
                      </CustomText>
                    </View>
                  ) : (
                    <ScrollView className='mt-4 max-h-48 w-full rounded-xl border-2 border-cinnabar p-4'>
                      {bids.map((bid, index) => {
                        const { username, profilePicture } = bid.User;
                        const initial = username
                          ? username.charAt(0).toUpperCase()
                          : '';
                        const currentPrice = getArticleCommissionedPrice(
                          bid.currentPrice,
                          LOW_COMMISSION_AMOUNT
                        );

                        return (
                          <View
                            key={index}
                            className='mb-2 flex flex-row items-center'
                          >
                            <View className='w-[40%] flex-row items-center gap-x-1'>
                              {profilePicture ? (
                                <CustomImage
                                  src={profilePicture}
                                  alt='User image'
                                  className='h-10 w-10 rounded-full'
                                />
                              ) : (
                                <View className='h-10 w-10 items-center justify-center rounded-full bg-black/10'>
                                  <Text className='font-semibold'>
                                    {initial}
                                  </Text>
                                </View>
                              )}
                              <Text className='uppercase'>{username}</Text>
                            </View>

                            <View className='ml-3 w-[60%] flex-row justify-center gap-x-2 lg:justify-end'>
                              <Text className='text-lg text-cinnabar'>
                                {formatter.format(currentPrice)}
                              </Text>

                              <View className='items-center'>
                                <FontAwesomeIcon
                                  variant='light'
                                  name='arrow-right'
                                  size={16}
                                />
                                <Text className='text-xs text-black/50'>
                                  + {formatter.format(bid.amount)}
                                </Text>
                              </View>

                              <Text className='text-lg text-cinnabar'>
                                {formatter.format(currentPrice + bid.amount)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
