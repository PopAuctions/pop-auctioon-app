import React, { useState } from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Lang } from '@/types/types';
import { FilterField } from '@/components/fields/FilterField';
import {
  ARTICLE_BRANDS,
  OFFERS_OPTIONS,
  ONLINE_STORE_ARTICLE_STATUS,
} from '@/constants';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { CustomLink } from '@/components/ui/CustomLink';
import { Filters } from '@/app/(tabs)/my-online-store';

interface Props {
  locale: Lang;
  texts: {
    newArticle: string;
  };
}

const FILTER_LABELS = {
  es: {
    filters: 'Filtros',
    brand: 'Marca',
    model: 'Modelo',
    codeNumber: 'Código',
    status: 'Estado',
    offersStatus: 'Estado de ofertas',
    activeFilters: 'Filtros activos:',
    clearAll: 'Borrar filtros',
    apply: 'Aplicar',
    close: 'Cerrar',
  },
  en: {
    filters: 'Filters',
    brand: 'Brand',
    model: 'Model',
    codeNumber: 'Code',
    status: 'Status',
    offersStatus: 'Offers status',
    activeFilters: 'Active filters:',
    apply: 'Apply',
    clearAll: 'Clear filters',
    close: 'Close',
  },
};

export function MyOnlineStoreArticleFilters({ locale, texts }: Props) {
  const params = useLocalSearchParams();
  const searchParams = params as Filters;
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const brandValue = getParam(searchParams.brand);
  const modelValue = getParam(searchParams.model);
  const codeNumberValue = getParam(searchParams.codeNumber);
  const offersStatusValue = getParam(searchParams.offersStatus);
  const statusValue = getParam(searchParams.status);

  const clearAllFilters = () => {
    router.setParams({
      brand: '',
      model: '',
      codeNumber: '',
      status: '',
      offersStatus: '',
    });
  };

  // Count only "real" filters, not sort
  const activeFilters = [
    brandValue,
    modelValue,
    codeNumberValue,
    statusValue,
    offersStatusValue,
  ].filter((v) => v !== '');
  const activeFiltersCount = activeFilters.length;
  const labels = FILTER_LABELS[locale];

  return (
    <>
      {/* Top bar: Filters button + Sort select */}
      <View className='flex w-full flex-row items-end justify-between gap-x-3'>
        {/* Filters button */}

        <Button
          mode='secondary'
          onPress={() => setIsFiltersModalOpen(true)}
        >
          {labels.filters}
        </Button>

        <CustomLink
          href='/my-online-store/new'
          mode='primary'
        >
          {texts.newArticle}
        </CustomLink>
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
                  key={`${activeFilters.join('-')}-offersStatus`}
                  id='offersStatus'
                  label={labels.offersStatus}
                  type='select'
                  value={offersStatusValue}
                  options={OFFERS_OPTIONS[locale]}
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
                  key={`${activeFilters.join('-')}-status`}
                  id='status'
                  label={labels.status}
                  type='select'
                  value={statusValue}
                  isSearchable
                  options={ONLINE_STORE_ARTICLE_STATUS[locale]}
                  isClearable={true}
                />

                <FilterField
                  className='w-full'
                  key={`${activeFilters.join('-')}-codeNumber`}
                  id='codeNumber'
                  label={labels.codeNumber}
                  type='input'
                  value={codeNumberValue}
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
