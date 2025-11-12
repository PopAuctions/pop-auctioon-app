import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Lang } from '@/types/types';
import { FilterField } from '../fields/FilterField';
import { ARTICLE_BRANDS, ARTICLE_PRICE_FILTER_LIST } from '@/constants';

interface Props {
  locale: Lang;
}

const FILTER_LABELS = {
  es: {
    brand: 'Marca',
    price: 'Precio',
  },
  en: {
    brand: 'Brand',
    price: 'Price',
  },
};

export function OnlineStoreArticleFilters({ locale }: Props) {
  const searchParams = useLocalSearchParams();

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const brandValue = getParam(searchParams.brand);
  const priceValue = getParam(searchParams.price);

  const activeFilters = [brandValue, priceValue].filter((v) => v !== '');

  return (
    <View className='flex w-full flex-row gap-x-3'>
      <FilterField
        className='w-1/2'
        key={`${activeFilters.join('-')}-brand`}
        id='brand'
        label={FILTER_LABELS[locale].brand}
        type='select'
        value={brandValue}
        isSearchable
        options={ARTICLE_BRANDS}
        isClearable={true}
      />
      <FilterField
        className='w-1/2'
        key={`${activeFilters.join('-')}-price`}
        id='price'
        label={FILTER_LABELS[locale].price}
        type='select'
        value={priceValue}
        options={ARTICLE_PRICE_FILTER_LIST}
        isClearable={true}
      />
    </View>
  );
}
