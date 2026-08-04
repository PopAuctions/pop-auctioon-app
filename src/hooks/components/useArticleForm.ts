import { useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEFAULT_VALUES_MAP,
  ArticleSchemasMap,
  ArticleFormValues,
  requireEstimatedValue,
} from '@/utils/schemas/articleSchemas';
import { AuctionCategories } from '@/types/types';
import * as z from 'zod';

interface UseArticleFormParams<C extends AuctionCategories> {
  category: C;
  mode: 'create' | 'edit';
  initialValues?: Partial<ArticleFormValues<C>>;
  auctionArticleForm?: boolean;
}

export function useArticleForm<C extends AuctionCategories>({
  category,
  mode,
  initialValues,
  auctionArticleForm = true,
}: UseArticleFormParams<C>) {
  const schema = ArticleSchemasMap[category];
  const finalSchema = (
    auctionArticleForm ? requireEstimatedValue(schema) : schema
  ) as z.ZodType<ArticleFormValues<C>, ArticleFormValues<C>>;

  const defaultValues = useMemo(() => {
    const base = DEFAULT_VALUES_MAP[category];

    const merged = {
      ...base,
      ...(mode === 'edit' && initialValues ? initialValues : {}),
    };

    return merged as DefaultValues<ArticleFormValues<C>>;
  }, [category, mode, initialValues]);

  const resolver = zodResolver(finalSchema) as unknown as Resolver<
    ArticleFormValues<C>
  >;

  const form = useForm<ArticleFormValues<C>>({
    resolver,
    defaultValues,
  });

  return {
    ...form,
    finalSchema,
    category,
    mode,
  };
}
