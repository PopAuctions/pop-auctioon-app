import { View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { Article, Lang } from '@/types/types';
import { CustomText } from '../ui/CustomText';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { Loading } from '../ui/Loading';
import { useLocalSearchParams } from 'expo-router';
import { useFetchMyAuctionArticles } from '@/hooks/components/useFetchMyAuctionArticles';
import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';
import { MyArticleItem } from './MyArticleItem';
import { Divider } from '../ui/Divider';
import { Fragment } from 'react';

const TEXTS = {
  noArticlesFound: {
    en: 'No articles found with the selected filters',
    es: 'No se han encontrado artículos con los filtros seleccionados',
  },
  errorOccurred: {
    en: 'An error occurred while fetching articles',
    es: 'Ocurrió un error al obtener los artículos',
  },
};

export const MyAuctionArticles = ({
  lang,
  auctionId,
  auctionStatus,
  order,
  texts,
}: {
  lang: Lang;
  auctionId: string;
  auctionStatus: AuctionStatus;
  order: number[];
  texts: { remove: string };
}) => {
  const { name } = useLocalSearchParams<{
    name?: string;
  }>();
  const {
    data: articles,
    status,
    errorMessage,
  } = useFetchMyAuctionArticles({ auctionId, name });

  const formatter = euroFormatter(lang);
  const isLoading = status === REQUEST_STATUS.loading;
  let iterableArticles = articles;

  if (isLoading) return <Loading locale={lang} />;

  if (status === REQUEST_STATUS.error) {
    return (
      <View className='items-center justify-center py-4'>
        <CustomText
          type='body'
          className='text-center text-cinnabar'
        >
          {errorMessage?.[lang] ?? TEXTS.errorOccurred[lang]}
        </CustomText>
      </View>
    );
  }

  if (name && articles.length === 0) {
    return (
      <View className='items-center justify-center py-4'>
        <CustomText
          type='body'
          className='text-center text-cinnabar'
        >
          {TEXTS.noArticlesFound[lang]}
        </CustomText>
      </View>
    );
  }

  if (
    [
      AuctionStatus.AVAILABLE,
      AuctionStatus.LIVE,
      AuctionStatus.FINISHED,
    ].includes(auctionStatus)
  ) {
    iterableArticles = getIterableArticles(articles, order, name);
  }

  return (
    <>
      {iterableArticles &&
        iterableArticles.map((article, index) => (
          <Fragment key={article.id}>
            <MyArticleItem
              article={article}
              auctionLang={{ remove: texts.remove }}
              formatter={formatter}
              lang={lang}
              commissionValue={LOW_COMMISSION_AMOUNT}
            />
            {index < iterableArticles.length - 1 && (
              <Divider className='my-2' />
            )}
          </Fragment>
        ))}
    </>
  );
};

function getIterableArticles(
  articles: Article[],
  articlesOrder: number[],
  search?: string
): Article[] {
  if (search) {
    return articles;
  }

  const articlesMap = articles.reduce<Record<string, Article>>(
    (acc, article) => {
      acc[article.id.toString()] = article;
      return acc;
    },
    {}
  );

  return articlesOrder
    .map((currentArticleId) => articlesMap[currentArticleId.toString()])
    .filter((article): article is Article => article !== undefined);
}
