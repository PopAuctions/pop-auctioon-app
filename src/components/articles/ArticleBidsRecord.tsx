import { useState } from 'react';
import { Lang } from '@/types/types';
import { Button } from '../ui/Button';
import { ArticleBidsRecordModal } from '../modal/ArticleBidsRecordModal';
import { useGetArticleBids } from '@/hooks/pages/article/useGetArticleBids';
import { REQUEST_STATUS } from '@/constants/app';
import { t } from '@/i18n';

type ArticleBidsRecordProps = {
  articleId: number;
  lang: Lang;
  initialPrice: number;
  commissionValue: number | null;
};

export function ArticleBidsRecord({
  articleId,
  lang,
  initialPrice,
  commissionValue,
}: ArticleBidsRecordProps) {
  const [open, setOpen] = useState(false);
  const { data, status } = useGetArticleBids({ articleId, shouldFetch: open });
  const texts = t('components.articleBidsRecord', { locale: lang });

  const isLoading = status === REQUEST_STATUS.loading;

  return (
    <>
      <Button
        className='w-2/3'
        mode='secondary'
        onPress={() => setOpen(true)}
      >
        {texts.label}
      </Button>

      <ArticleBidsRecordModal
        visible={open}
        lang={lang}
        initialPrice={initialPrice}
        onClose={() => setOpen(false)}
        texts={texts}
        bids={data}
        isLoading={isLoading}
        commissionValue={commissionValue}
      />
    </>
  );
}
