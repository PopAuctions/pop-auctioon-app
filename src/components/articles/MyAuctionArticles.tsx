import { Pressable, View } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { Article, Lang } from '@/types/types';
import { LOW_COMMISSION_AMOUNT } from '@/constants/payment';
import { useLocalSearchParams } from 'expo-router';
import { useFetchMyAuctionArticles } from '@/hooks/components/useFetchMyAuctionArticles';
import { REQUEST_STATUS } from '@/constants';
import { AuctionStatus } from '@/constants/auctions';
import { MyArticleItem } from './MyArticleItem';
import { Divider } from '../ui/Divider';
import { useEffect, useMemo, useState } from 'react';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { MyAuctionArticlesState } from './MyAuctionArticlesState';

export const MyAuctionArticles = ({
  lang,
  auctionId,
  auctionStatus,
  order,
  texts,
  isOrderingItems,
  onChangeOrder,
  ListHeaderComponent,
}: {
  lang: Lang;
  auctionId: string;
  auctionStatus: AuctionStatus;
  order: number[];
  texts: {
    editText: string;
    deleteText: string;
    removeText: string;
    orderImagesText: string;
    featuredText: string;
    unfeaturedText: string;
  };
  isOrderingItems: boolean;
  onChangeOrder: (newOrder: number[]) => void;
  ListHeaderComponent: React.ReactElement;
}) => {
  const [listData, setListData] = useState<Article[]>([]);
  const { name } = useLocalSearchParams<{ name?: string }>();
  const {
    data: articles,
    status,
    errorMessage,
    refetch,
  } = useFetchMyAuctionArticles({ auctionId, name });

  const formatter = euroFormatter(lang);
  const isLoading = status === REQUEST_STATUS.loading;

  const showNoResults =
    Boolean(name) &&
    articles.length === 0 &&
    !isLoading &&
    status !== REQUEST_STATUS.error;
  const listDataToRender =
    isLoading || status === REQUEST_STATUS.error || showNoResults
      ? []
      : listData;

  const iterableArticles = useMemo(() => {
    if (
      status === REQUEST_STATUS.error ||
      ![
        AuctionStatus.AVAILABLE,
        AuctionStatus.LIVE,
        AuctionStatus.FINISHED,
      ].includes(auctionStatus)
    ) {
      return articles;
    }

    return getIterableArticles(articles, order, name);
  }, [articles, order, name, status, auctionStatus]);

  const handleDragEnd = ({ data }: { data: Article[] }) => {
    setListData(data);
    const newOrder = data.map((article) => article.id);
    onChangeOrder(newOrder);
  };

  useEffect(() => {
    setListData(iterableArticles);
  }, [iterableArticles]);

  const renderDraggableItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Article>) => {
    const index = getIndex() ?? 0;

    return (
      <Pressable
        onLongPress={isOrderingItems ? drag : undefined}
        disabled={!isOrderingItems}
        delayLongPress={150}
      >
        <View className={isActive ? 'opacity-70' : ''}>
          <MyArticleItem
            article={item}
            auctionId={auctionId}
            auctionStatus={auctionStatus}
            showActions={true}
            texts={{
              editText: texts.editText,
              deleteText: texts.deleteText,
              removeText: texts.removeText,
              orderImagesText: texts.orderImagesText,
              featuredText: texts.featuredText,
              unfeaturedText: texts.unfeaturedText,
            }}
            formatter={formatter}
            locale={lang}
            commissionValue={LOW_COMMISSION_AMOUNT}
            refetch={refetch}
          />
          {index < listDataToRender.length - 1 && <Divider className='my-2' />}
        </View>
      </Pressable>
    );
  };

  return (
    <DraggableFlatList
      data={listDataToRender}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderDraggableItem}
      onDragEnd={handleDragEnd}
      activationDistance={isOrderingItems ? 12 : Number.MAX_SAFE_INTEGER}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          <MyAuctionArticlesState
            lang={lang}
            isLoading={isLoading}
            status={status}
            errorMessage={errorMessage}
            showNoResults={showNoResults}
          />
        </>
      }
    />
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
