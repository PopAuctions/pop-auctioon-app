import { Comment } from '@/types/types';
import { View } from 'react-native';
import { CustomText } from '../ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export const ArticleComments = ({ comments }: { comments: Comment[] }) => {
  const { t, locale } = useTranslation();
  const newArticle = t('screens.newArticle');

  return (
    <View className='mb-4 rounded-xl border border-silver bg-slate-50 px-4 py-2'>
      {comments.length > 0 && (
        <View className='flex w-3/4 flex-col'>
          <CustomText type='subtitle'>{newArticle.comments}:</CustomText>

          {/* Último comentario */}
          <CustomText
            type='body'
            className='font-bold'
          >
            {newArticle.lastComment}:{' '}
            <CustomText
              type='body'
              className='font-bold text-[#f00]'
            >
              {comments[comments.length - 1][locale]}
            </CustomText>
          </CustomText>

          {/* Comentarios anteriores */}
          {comments.length > 1 && (
            <View className='mt-2'>
              <CustomText
                type='body'
                className='font-bold'
              >
                {newArticle.previousComment}:
              </CustomText>

              <View className='mt-1'>
                {comments.slice(0, -1).map((comment, index) => (
                  <View
                    key={index}
                    className='flex-row'
                  >
                    {/* bullet */}
                    <CustomText
                      type='body'
                      className='ml-2'
                    >
                      {'\u2022 '}
                    </CustomText>
                    <CustomText
                      type='body'
                      className='flex-1'
                    >
                      {comment[locale]}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
