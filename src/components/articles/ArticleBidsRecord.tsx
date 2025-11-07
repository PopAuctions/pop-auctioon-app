import { useState } from 'react';
import { Lang } from '@/types/types';
import { Button } from '../ui/Button';
import { ArticleBidsRecordModal } from '../modal/ArticleBidsRecordModal';
import { useGetArticleBids } from '@/hooks/pages/article/useGetArticleBids';
import { REQUEST_STATUS } from '@/constants/app';

type ArticleBidsRecordProps = {
  articleId: number;
  lang: Lang;
  initialPrice: number;
};

const TEXTS = {
  en: {
    label: 'Bids record',
    title: 'Bids',
    initialPrice: 'Initial price',
    noBidsYet: 'No bids yet.',
  },
  es: {
    label: 'Historial de pujas',
    title: 'Pujas',
    initialPrice: 'Precio inicial',
    noBidsYet: 'No hay pujas aún.',
  },
};

export function ArticleBidsRecord({
  articleId,
  lang,
  initialPrice,
}: ArticleBidsRecordProps) {
  const [open, setOpen] = useState(false);
  const { data, status } = useGetArticleBids({ articleId, shouldFetch: open });
  const texts = TEXTS[lang];

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
      />
    </>
  );
}
