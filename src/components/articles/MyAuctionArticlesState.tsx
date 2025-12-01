import { Lang, LangMap, RequestStatus } from '@/types/types';
import React from 'react';
import { View } from 'react-native';
import { Loading } from '../ui/Loading';
import { CustomText } from '../ui/CustomText';
import { REQUEST_STATUS } from '@/constants/app';

const TEXTS = {
  noArticlesFound: {
    en: 'No articles found with the selected filters',
    es: 'No se han encontrado artículos con los filtros seleccionados',
  },
  errorOccurred: {
    en: 'An error occurred while fetching articles',
    es: 'Ocurrió un error al obtener los artículos',
  },
};

interface Props {
  lang: Lang;
  isLoading: boolean;
  status: RequestStatus;
  errorMessage: LangMap | null;
  showNoResults: boolean;
}

export function MyAuctionArticlesState({
  lang,
  isLoading,
  status,
  errorMessage,
  showNoResults,
}: Props) {
  if (isLoading) {
    return (
      <View className='py-4'>
        <Loading locale={lang} />
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
          {errorMessage?.[lang] ?? TEXTS.errorOccurred[lang]}
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
          {TEXTS.noArticlesFound[lang]}
        </CustomText>
      </View>
    );
  }

  return null;
}
