import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Lang } from '@/types/types';
import { FilterField } from '../fields/FilterField';

interface Props {
  locale: Lang;
}

const FILTER_LABELS = {
  es: {
    name: 'Name',
  },
  en: {
    name: 'Name',
  },
};

export function MyAuctionArticlesFilters({ locale }: Props) {
  const searchParams = useLocalSearchParams();

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const nameValue = getParam(searchParams.name);
  const activeFilters = [nameValue].filter((v) => v !== '');

  return (
    <View className='flex flex-row gap-x-3'>
      <FilterField
        key={`${activeFilters.join('-')}-name`}
        className='w-2/3'
        id='name'
        label={FILTER_LABELS[locale].name}
        type='input'
        value={nameValue}
        isClearable={true}
      />
    </View>
  );
}
