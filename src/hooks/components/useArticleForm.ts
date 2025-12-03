import { useMemo } from 'react';
import { DefaultValues, Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEFAULT_VALUES_MAP,
  ArticleSchemasMap,
  ArticleFormValues,
} from '@/utils/schemas/articleSchemas';
import { AuctionCategories } from '@/types/types';

interface UseArticleFormParams<C extends AuctionCategories> {
  category: C;
  mode: 'create' | 'edit';
  initialValues?: Partial<ArticleFormValues<C>>;
}

export function useArticleForm<C extends AuctionCategories>({
  category,
  mode,
  initialValues,
}: UseArticleFormParams<C>) {
  const schema = ArticleSchemasMap[category];

  const defaultValues = useMemo(() => {
    const base = DEFAULT_VALUES_MAP[category];

    const merged = {
      ...base,
      ...(mode === 'edit' && initialValues ? initialValues : {}),
    };

    return merged as DefaultValues<ArticleFormValues<C>>;
  }, [category, mode, initialValues]);

  const resolver = zodResolver(schema) as unknown as Resolver<
    ArticleFormValues<C>
  >;

  const form = useForm<ArticleFormValues<C>>({
    resolver,
    defaultValues,
  });

  return {
    ...form,
    schema,
    category,
    mode,
  };
}
