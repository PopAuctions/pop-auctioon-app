/**
 * PaymentArticlesList - Lista de artículos ganados con checkboxes
 * Incluye:
 * - Checkbox para seleccionar/deseleccionar
 * - Imagen del artículo
 * - Título, marca y precio de venta
 * - Estilo condicional cuando está seleccionado
 */

import { View } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { CustomText } from '@/components/ui/CustomText';
import { CustomImage } from '@/components/ui/CustomImage';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { euroFormatter } from '@/utils/euroFormatter';
import { cn } from '@/utils/cn';
import type { CustomArticle } from '@/types/types';

interface PaymentArticlesListProps {
  articles: CustomArticle[];
  selectedArticleIds: number[];
  onToggleArticle: (articleId: number) => void;
}

export function PaymentArticlesList({
  articles,
  selectedArticleIds,
  onToggleArticle,
}: PaymentArticlesListProps) {
  const { locale } = useTranslation();
  const formatter = euroFormatter(locale, 2);

  return (
    <View className='mb-6 flex flex-col gap-4'>
      {articles.map((article) => {
        const isSelected = selectedArticleIds.includes(article.id);

        return (
          <View
            key={article.id}
            className={cn(
              'flex-row items-center gap-4 rounded-lg border-2 p-4',
              isSelected ? 'border-cinnabar bg-orange-50' : 'border-gray-200'
            )}
          >
            {/* Checkbox */}
            <Checkbox
              value={isSelected}
              onValueChange={() => onToggleArticle(article.id)}
              color={isSelected ? '#d75639' : undefined}
            />

            {/* Imagen del artículo */}
            <View className='aspect-square w-20 overflow-hidden rounded-lg'>
              <CustomImage
                src={article.images?.[0] || ''}
                alt={article.title}
                className='h-full w-full'
                resizeMode='cover'
              />
            </View>

            {/* Info del artículo */}
            <View className='flex-1'>
              <CustomText
                type='h4'
                className='mb-1'
              >
                {article.title}
              </CustomText>
              {article.brand && (
                <CustomText
                  type='bodysmall'
                  className='text-gray-500 mb-2'
                >
                  {article.brand}
                </CustomText>
              )}
              <CustomText
                type='body'
                className='font-bold text-cinnabar'
              >
                {formatter.format(article.soldPrice || 0)}
              </CustomText>
            </View>
          </View>
        );
      })}
    </View>
  );
}
