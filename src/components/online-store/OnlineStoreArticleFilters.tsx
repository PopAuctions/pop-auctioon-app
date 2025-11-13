import React, { useState } from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Lang } from '@/types/types';
import { FilterField } from '../fields/FilterField';
import {
  ARTICLE_BRANDS,
  ARTICLE_PRICE_FILTER_LIST,
  ARTICLE_CATEGORIES_FILTER_LIST,
  SORT_BY,
} from '@/constants';
import { Button } from '../ui/Button';
import { CustomText } from '../ui/CustomText';
import { Filters } from '@/app/(tabs)/online-store';

interface Props {
  locale: Lang;
}

const FILTER_LABELS = {
  es: {
    filters: 'Filtros',
    brand: 'Marca',
    price: 'Precio',
    model: 'Modelo',
    code: 'Código',
    category: 'Categoría',
    sort: 'Ordenar por',
    activeFilters: 'Filtros activos:',
    clearAll: 'Borrar filtros',
    apply: 'Aplicar',
    close: 'Cerrar',
  },
  en: {
    filters: 'Filters',
    brand: 'Brand',
    price: 'Price',
    model: 'Model',
    code: 'Code',
    category: 'Category',
    sort: 'Sort by',
    activeFilters: 'Active filters:',
    apply: 'Apply',
    clearAll: 'Clear filters',
    close: 'Close',
  },
};

export function OnlineStoreArticleFilters({ locale }: Props) {
  const params = useLocalSearchParams();
  const searchParams = params as Filters;
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const brandValue = getParam(searchParams.brand);
  const priceValue = getParam(searchParams.price);
  const modelValue = getParam(searchParams.model);
  const codeValue = getParam(searchParams.codeNumber);
  const categoryValue = getParam(searchParams.category);
  const sortValue = getParam(searchParams.sortBy) || SORT_BY[locale][0].value;

  const clearAllFilters = () => {
    router.setParams({
      brand: '',
      price: '',
      model: '',
      codeNumber: '',
      category: '',
    });
  };

  // Count only "real" filters, not sort
  const activeFilters = [
    brandValue,
    priceValue,
    modelValue,
    codeValue,
    categoryValue,
  ].filter((v) => v !== '');
  const activeFiltersCount = activeFilters.length;
  const labels = FILTER_LABELS[locale];

  return (
    <>
      {/* Top bar: Filters button + Sort select */}
      <View className='flex w-full flex-row items-end justify-between gap-x-3'>
        {/* Filters button */}

        <Button
          mode='primary'
          onPress={() => setIsFiltersModalOpen(true)}
        >
          {labels.filters}
        </Button>

        <FilterField
          id='sortBy'
          className='w-2/5'
          key={`sortBy-${sortValue}`}
          label={labels.sort}
          type='select'
          value={sortValue}
          options={SORT_BY[locale]}
          isClearable={false}
        />
      </View>
      <View className='mt-1'>
        {activeFiltersCount > 0 && (
          <>
            <Text className='text-base text-black'>
              {labels.activeFilters} {activeFiltersCount}
            </Text>
            <Button
              mode='empty'
              onPress={() => {
                clearAllFilters();
              }}
              className='self-start'
              textClassName='underline'
            >
              {labels.clearAll}
            </Button>
          </>
        )}
      </View>

      {/* Filters modal */}
      <Modal
        visible={isFiltersModalOpen}
        animationType='slide'
        transparent
        onRequestClose={() => setIsFiltersModalOpen(false)}
      >
        <View className='flex-1 items-center justify-center bg-black/40'>
          <View className='w-11/12 rounded-2xl bg-white p-4'>
            <CustomText type='h3'>{labels.filters}</CustomText>

            <View className='self-end'>
              <Button
                mode='empty'
                onPress={() => {
                  clearAllFilters();
                  setIsFiltersModalOpen(false);
                }}
                textClassName='underline'
              >
                {labels.clearAll}
              </Button>
            </View>
            <ScrollView className='max-h-[60vh]'>
              <View className='flex flex-col gap-y-3'>
                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-model`}
                  id='model'
                  label={labels.model}
                  type='input'
                  value={modelValue}
                  isClearable={true}
                />

                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-code`}
                  id='codeNumber'
                  label={labels.code}
                  type='input'
                  value={codeValue}
                  isClearable={true}
                />

                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-brand`}
                  id='brand'
                  label={labels.brand}
                  type='select'
                  value={brandValue}
                  isSearchable
                  options={ARTICLE_BRANDS}
                  isClearable={true}
                />

                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-price`}
                  id='price'
                  label={labels.price}
                  type='select'
                  value={priceValue}
                  options={ARTICLE_PRICE_FILTER_LIST}
                  isClearable={true}
                />

                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-category`}
                  id='category'
                  label={labels.category}
                  type='select'
                  value={categoryValue}
                  options={ARTICLE_CATEGORIES_FILTER_LIST[locale]}
                  isClearable={true}
                />
              </View>
            </ScrollView>

            {/* Footer actions */}
            <View className='mt-4 flex flex-row justify-center gap-x-3'>
              <Button
                mode='primary'
                onPress={() => {
                  setIsFiltersModalOpen(false);
                }}
                className='w-1/2'
              >
                {labels.close}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
