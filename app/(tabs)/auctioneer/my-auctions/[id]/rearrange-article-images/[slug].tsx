import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArticleImagesOrderList } from '@/components/articles/ArticleImagesOrderList';
import { useGetArticle } from '@/hooks/pages/article/useGetArticle';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useArticle } from '@/hooks/pages/my-auction/useArticle';
import { useToast } from '@/hooks/useToast';

export default function RearrangeArticleImagesScreen() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug: string }>();
  const { locale } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const { callToast } = useToast(locale);

  const auctionId = String(id);
  const articleId = Number(slug);

  const {
    data: article,
    status,
    errorMessage,
  } = useGetArticle({ articleId: articleId });
  const { editArticleImagesOrder } = useArticle({ auctionId });

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  if (status === REQUEST_STATUS.error || !article || !article.images) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute={`/(tabs)/auctioneer/my-auctions/${auctionId}/rearrange-article-images/${articleId}`}
      />
    );
  }

  const handleSaveChanges = async (newOrder: string[]) => {
    setIsSaving(true);

    if (JSON.stringify(newOrder) === JSON.stringify(article.images)) {
      setIsSaving(false);
      callToast({
        variant: 'error',
        description: {
          en: 'No changes to save',
          es: 'No hay cambios para guardar',
        },
      });
      return;
    }

    const response = await editArticleImagesOrder({
      articleId: articleId,
      newOrder: newOrder,
    });

    if (response.status === 'error') {
      setIsSaving(false);
      return;
    }

    router.navigate(`/(tabs)/auctioneer/my-auctions/${auctionId}`);
    setIsSaving(false);
  };

  return (
    <View className='flex-1'>
      <ArticleImagesOrderList
        images={article.images}
        isSaving={isSaving}
        onSaveOrder={handleSaveChanges}
      />
    </View>
  );
}
