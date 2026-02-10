import { View, TouchableOpacity, ScrollView } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { Loading } from '@/components/ui/Loading';
import { useGetArticle } from '@/hooks/pages/article/useGetArticle';
import { ARTICLE_BRANDS_LABELS, REQUEST_STATUS } from '@/constants';
import { ImagesCarousel } from '@/components/ui/ImagesCarousel';
import { ArticleSpecificationsSection } from '@/components/articles/ArticleSpecificationsSection';
import { formatTextToParagraph } from '@/utils/formatTextToParagraph';
import { useTranslation } from '@/hooks/i18n/useTranslation';

type StreamInfoModalProps = {
  onClose: () => void;
  currentArticleId: number;
  texts: {
    currentArticle: string;
  };
};

export const LiveCurrentArticleContent = ({
  onClose,
  currentArticleId,
  texts,
}: StreamInfoModalProps) => {
  const { t, locale } = useTranslation();
  const { data: article, status } = useGetArticle({
    articleId: currentArticleId,
  });

  const articleReady = status === REQUEST_STATUS.success;
  const articleLang = t('screens.article');

  return (
    <View className='w-full max-w-md overflow-hidden rounded-2xl bg-white/70 pb-4'>
      {/* Header */}
      <View className='border-gray-200 flex-row items-center justify-between border-b px-6 py-4'>
        <CustomText
          type='subtitle'
          className='text-xl'
        >
          {texts.currentArticle}
        </CustomText>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={10}
        >
          <FontAwesomeIcon
            variant='bold'
            name='close'
            size={24}
            color='cinnabar'
          />
        </TouchableOpacity>
      </View>

      {articleReady && article ? (
        <ScrollView
          className='flex max-h-[500px] min-h-96 flex-col p-4'
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CustomText
            type='h3'
            className='text-center text-black'
          >
            {article.title}
          </CustomText>
          <CustomText
            type='body'
            className='text-center text-black'
          >
            {ARTICLE_BRANDS_LABELS[
              article.brand as keyof typeof ARTICLE_BRANDS_LABELS
            ] ??
              article.brand ??
              ''}
          </CustomText>
          <View className='mt-2 w-3/5'>
            <ImagesCarousel images={article?.images || []} />
          </View>
          <View className='mt-10 w-full flex-col gap-3 md:flex-row md:gap-5'>
            <ArticleSpecificationsSection
              article={article}
              articleLang={articleLang}
              lang={locale}
              articleCategory={article.category}
            />

            {!!article?.observations && (
              <View className='w-full rounded-md border border-black p-4 md:flex-1'>
                <>
                  <CustomText
                    type='subtitle'
                    className='text-2xl font-bold'
                  >
                    {articleLang.observations}
                  </CustomText>
                  {formatTextToParagraph(article.observations)}
                </>
              </View>
            )}
            <View className='w-full rounded-md border border-black p-4 md:flex-1'>
              <CustomText
                type='subtitle'
                className='text-2xl font-bold'
              >
                {articleLang.description}
              </CustomText>
              {formatTextToParagraph(article.description ?? '')}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className='min-h-96'>
          <Loading locale={locale} />
        </View>
      )}
    </View>
  );
};
