import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArticleImagesOrderList } from '@/components/articles/ArticleImagesOrderList';
import { Loading } from '@/components/ui/Loading';
import { REQUEST_STATUS } from '@/constants';
import { CustomError } from '@/components/ui/CustomError';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useToast } from '@/hooks/useToast';
import { useOnlineStoreArticle } from '@/hooks/pages/online-store/useOnlineStoreArticle';
import { useGetOnlineStoreArticle } from '@/hooks/pages/online-store/useGetOnlineStoreArticle';

export default function MyOnlineStoreArticleRearrangeImagesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const { callToast } = useToast(locale);

  const articleId = Number(id);

  const {
    data: onlineStoreArticle,
    status,
    errorMessage,
  } = useGetOnlineStoreArticle({ articleId: articleId });
  const { editArticleImagesOrder } = useOnlineStoreArticle();

  if (status === REQUEST_STATUS.idle || status === REQUEST_STATUS.loading) {
    return <Loading locale={locale} />;
  }

  const article = onlineStoreArticle?.Article;
  if (
    status === REQUEST_STATUS.error ||
    !onlineStoreArticle ||
    !article?.images
  ) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute={`/(tabs)/my-online-store/articles/${articleId}/rearrange-images`}
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

    router.navigate(`/(tabs)/my-online-store/articles/${articleId}`);
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
