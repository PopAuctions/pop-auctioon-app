import { useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AUCTION_DEFAULT_VALUES_MAP,
  AuctionFormValues,
  AuctionSchema,
} from '@/utils/schemas/auctionSchemas';

interface UseAuctionFormParams {
  mode: 'create' | 'edit';
  initialValues?: AuctionFormValues;
}

export function useAuctionForm({ mode, initialValues }: UseAuctionFormParams) {
  const schema = AuctionSchema;

  const defaultValues = useMemo(() => {
    const base = AUCTION_DEFAULT_VALUES_MAP;

    const merged = {
      ...base,
      ...(mode === 'edit' && initialValues ? initialValues : {}),
    };

    return merged as DefaultValues<AuctionFormValues>;
  }, [mode, initialValues]);

  const resolver = zodResolver(
    schema
  ) as unknown as Resolver<AuctionFormValues>;

  const form = useForm<AuctionFormValues>({
    resolver,
    defaultValues,
  });

  return {
    ...form,
    schema,

    mode,
  };
}
