import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { CustomText } from './CustomText';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <View className='mt-6 flex w-full flex-row items-center justify-center gap-4'>
      <Button
        mode='secondary'
        size='small'
        disabled={!canGoPrev}
        onPress={() => canGoPrev && onPageChange(page - 1)}
      >
        {'<'}
      </Button>

      <CustomText
        type='body'
        className='self-center text-sm'
      >
        {page} / {totalPages}
      </CustomText>

      <Button
        mode='secondary'
        size='small'
        disabled={!canGoNext}
        onPress={() => canGoNext && onPageChange(page + 1)}
      >
        {'>'}
      </Button>
    </View>
  );
}
