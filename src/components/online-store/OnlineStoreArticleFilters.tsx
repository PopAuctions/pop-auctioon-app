import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Lang } from '@/types/types';
import { FilterField } from '../fields/FilterField';
import {
  ARTICLE_BRANDS,
  ARTICLE_PRICE_FILTER_LIST,
  SORT_BY,
  ARTICLE_COLORS_FILTER_LIST,
  ARTICLE_MATERIALS_FILTER_LIST,
} from '@/constants';
import { Button } from '../ui/Button';
import { Filters } from '@/app/(tabs)/online-store';
import { ArticlesSuggestionField } from '@/components/fields/ArticlesSuggestionField';

interface Props {
  locale: Lang;
}

const FILTER_LABELS = {
  es: {
    brand: 'Marca',
    price: 'Precio',
    model: 'Modelo',
    material: 'Material',
    color: 'Color',
    sort: 'Ordenar por',
    activeFilters: 'Filtros activos:',
    clearAll: 'Borrar filtros',
  },
  en: {
    brand: 'Brand',
    price: 'Price',
    model: 'Model',
    material: 'Material',
    color: 'Color',
    sort: 'Sort by',
    activeFilters: 'Active filters:',
    clearAll: 'Clear filters',
  },
};

export function OnlineStoreArticleFilters({ locale }: Props) {
  const params = useLocalSearchParams();
  const searchParams = params as Filters;

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const brandValue = getParam(searchParams.brand);
  const priceValue = getParam(searchParams.price);
  const modelValue = getParam(searchParams.model);
  const colorValue = getParam(searchParams.color);
  const materialValue = getParam(searchParams.material);
  const sortValue = getParam(searchParams.sortBy) || SORT_BY[locale][0].value;

  const clearAllFilters = () => {
    router.setParams({
      brand: '',
      price: '',
      model: '',
      material: '',
      color: '',
    });
  };

  const activeFilters = [
    brandValue,
    priceValue,
    modelValue,
    colorValue,
    materialValue,
  ].filter((v) => v !== '');
  const activeFiltersCount = activeFilters.length;
  const labels = FILTER_LABELS[locale];

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName='gap-x-3 pb-1'
      >
        <FilterField
          id='sortBy'
          className='w-40'
          key={`sortBy-${sortValue}`}
          label={labels.sort}
          type='select'
          value={sortValue}
          options={SORT_BY[locale]}
          isClearable={false}
        />

        <ArticlesSuggestionField
          className='w-56'
          key={`model-${modelValue}`}
          id='model'
          label={labels.model}
          value={modelValue}
          isClearable
        />

        <FilterField
          className='w-48'
          key={`brand-${brandValue}`}
          id='brand'
          label={labels.brand}
          type='select'
          value={brandValue}
          isSearchable
          options={ARTICLE_BRANDS}
          isClearable={true}
        />

        <FilterField
          className='w-44'
          key={`material-${materialValue}`}
          id='material'
          label={labels.material}
          type='select'
          isSearchable
          value={materialValue}
          options={ARTICLE_MATERIALS_FILTER_LIST[locale]}
          isClearable={true}
        />

        <FilterField
          className='w-48'
          key={`price-${priceValue}`}
          id='price'
          label={labels.price}
          type='select'
          value={priceValue}
          options={ARTICLE_PRICE_FILTER_LIST}
          isClearable={true}
        />

        <FilterField
          className='w-48'
          key={`color-${colorValue}`}
          id='color'
          label={labels.color}
          type='select'
          isSearchable
          value={colorValue}
          options={ARTICLE_COLORS_FILTER_LIST[locale]}
          isClearable={true}
        />
      </ScrollView>

      {activeFiltersCount > 0 && (
        <View className='mt-1 flex flex-row items-center gap-x-2'>
          <Text className='text-sm text-black'>
            {labels.activeFilters} {activeFiltersCount}
          </Text>
          <Button
            mode='empty'
            onPress={clearAllFilters}
            className='self-start'
            textClassName='underline'
          >
            {labels.clearAll}
          </Button>
        </View>
      )}
    </>
  );
}
