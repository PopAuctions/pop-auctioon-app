import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FilterField } from '@/components/fields/FilterField';
import { Lang } from '@/types/types';
import { PAID_FILTER_OPTIONS } from '@/constants';
import { t } from '@/i18n';

interface Props {
  locale: Lang;
  auctionsList: { value: string; label: string }[];
}

export function SoldArticlesFilters({ locale, auctionsList }: Props) {
  const searchParams = useLocalSearchParams();
  const labels = t('components.filters', { locale });

  const getParam = (v: unknown): string => {
    if (Array.isArray(v)) return v[0] ?? '';
    return typeof v === 'string' ? v : '';
  };

  const auctionIdValue = getParam(searchParams.auctionId);
  const statusValue = getParam(searchParams.status);
  const activeFilters = [auctionIdValue, statusValue].filter((v) => v !== '');

  return (
    <View className='flex w-full flex-row gap-x-3'>
      <FilterField
        className='w-1/2'
        key={`${activeFilters.join('-')}-auction`}
        id='auctionId'
        label={labels.auction}
        type='select'
        value={auctionIdValue}
        isSearchable
        options={auctionsList}
        isClearable={true}
      />
      <FilterField
        className='w-1/2'
        key={`${activeFilters.join('-')}-status`}
        id='status'
        label={labels.status}
        type='select'
        value={statusValue}
        options={PAID_FILTER_OPTIONS[locale]}
        isClearable={true}
      />
    </View>
  );
}
