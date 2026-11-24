import { RequestStatus } from '@/types/types';
import React from 'react';
import { View } from 'react-native';
import { Loading } from '../ui/Loading';
import { CustomText } from '../ui/CustomText';
import { REQUEST_STATUS } from '@/constants/app';

interface Props {
  isLoading: boolean;
  status: RequestStatus;
  errorMessage: string | null;
  showNoResults: boolean;
  texts: {
    noArticlesFound: string;
    errorOccurred: string;
  };
}

export function MyAuctionArticlesState({
  isLoading,
  status,
  errorMessage,
  showNoResults,
  texts,
}: Props) {
  if (isLoading) {
    return (
      <View className='py-4'>
        <Loading />
      </View>
    );
  }

  if (status === REQUEST_STATUS.error) {
    return (
      <View className='items-center justify-center py-4'>
        <CustomText
          type='body'
          className='text-center text-cinnabar'
        >
          {errorMessage ?? texts.errorOccurred}
        </CustomText>
      </View>
    );
  }

  if (showNoResults) {
    return (
      <View className='items-center justify-center py-4'>
        <CustomText
          type='body'
          className='text-center text-cinnabar'
        >
          {texts.noArticlesFound}
        </CustomText>
      </View>
    );
  }

  return null;
}
