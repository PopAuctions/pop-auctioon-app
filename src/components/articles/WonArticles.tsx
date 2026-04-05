import React, { useMemo } from 'react';
import { View, SectionList } from 'react-native';
import { euroFormatter } from '@/utils/euroFormatter';
import { getArticleCommissionedPrice } from '@/utils/getArticleCommissionedPrice';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomText } from '@/components/ui/CustomText';
import { AuctionUserWonArticles, CustomArticle, Lang } from '@/types/types';
import { CustomImage } from '@/components/ui/CustomImage';

type WonArticlesProps = {
  wonArticles: Record<string, AuctionUserWonArticles>;
  lang: Lang;
  commissionValue: number;
  texts: {
    winningBid: string;
    payArticles: string;
    view: string;
    noArticlesWon: string;
  };
};

type SectionItemRow = CustomArticle[];

export const WonArticles = ({
  wonArticles,
  lang,
  commissionValue,
  texts: { winningBid, payArticles, view, noArticlesWon },
}: WonArticlesProps) => {
  const formatter = euroFormatter(lang);

  const sections = useMemo(() => {
    return Object.entries(wonArticles).map(([auctionId, data]) => {
      // chunk into rows of 2 for a grid look
      const rows: SectionItemRow[] = [];
      for (let i = 0; i < data.articles.length; i += 2) {
        rows.push(data.articles.slice(i, i + 2));
      }

      return {
        auctionId,
        title: data.title,
        data: rows,
      };
    });
  }, [wonArticles]);

  if (sections.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <CustomText
          type='h2'
          className='text-center text-cinnabar'
        >
          {noArticlesWon}
        </CustomText>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(row, index) =>
        `${row[0]?.id ?? 'row'}-${row[1]?.id ?? 'x'}-${index}`
      }
      stickySectionHeadersEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      renderSectionHeader={({ section }) => (
        <View className='my-5 flex-row items-center justify-between rounded-2xl bg-white px-5 py-2'>
          <CustomText
            className='w-3/5'
            type='h3'
          >
            {section.title}
          </CustomText>

          <CustomLink
            className='w-2/5'
            mode='primary'
            size='small'
            href={`/(tabs)/account/payment?auctionId=${section.auctionId}`}
          >
            {payArticles}
          </CustomLink>
        </View>
      )}
      renderItem={({ item: row }) => (
        <View
          className='flex-row'
          style={{ gap: 12 }}
        >
          {row.map((article) => (
            <WonArticleItem
              key={article.id.toString()}
              article={article}
              texts={{ winningBid, view }}
              commissionValue={commissionValue}
              formatter={formatter}
            />
          ))}

          {/* if odd count, fill the empty space so layout stays aligned */}
          {row.length === 1 ? <View className='flex-1' /> : null}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    />
  );
};

type WonArticleItemProps = {
  article: CustomArticle;
  texts: { winningBid: string; view: string };
  commissionValue: number;
  formatter: Intl.NumberFormat;
};

export const WonArticleItem = ({
  article,
  texts: { winningBid, view },
  commissionValue,
  formatter,
}: WonArticleItemProps) => {
  const soldPrice = article.soldPrice;
  const commissionedSoldPrice = useMemo(
    () => getArticleCommissionedPrice(soldPrice, commissionValue),
    [soldPrice, commissionValue]
  );

  const imageSrc = article.images?.[0];

  return (
    <View className='flex-1'>
      <View className='w-full rounded-2xl bg-white p-3'>
        <View className='w-full overflow-hidden rounded-xl'>
          <CustomImage
            src={imageSrc}
            alt='Article Image'
            className='aspect-square w-full'
            resizeMode='cover'
          />
        </View>

        <View className='mt-3'>
          <View className='flex flex-col items-start'>
            <CustomText
              type='subtitle'
              className='leading-5'
            >
              {winningBid}:
            </CustomText>
            <CustomText
              type='subtitle'
              className='leading-5'
            >
              {formatter.format(commissionedSoldPrice)}
            </CustomText>
          </View>

          <CustomText type='h4'>{article.title}</CustomText>

          <CustomLink
            mode='secondary'
            href={`/(tabs)/auctions/articles/${article.id}`}
            className='mt-2 self-start'
          >
            {view}
          </CustomLink>
        </View>
      </View>
    </View>
  );
};
