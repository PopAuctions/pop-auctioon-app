import { Lang, LangMap } from '@/types/types';
import { View } from '../Themed';
import { CustomText } from './CustomText';
import { ActivityIndicator } from 'react-native';

const TEXTS = {
  loading: {
    en: 'Loading...',
    es: 'Cargando...',
  },
};

export const Loading = ({
  locale,
  customMessage,
}: {
  locale: Lang;
  customMessage?: LangMap;
}) => {
  return (
    <View className='flex-1 items-center justify-center'>
      <ActivityIndicator
        size='large'
        color='#d75639'
      />
      <CustomText
        type='body'
        className='mt-4 text-center text-black'
      >
        {customMessage?.[locale] ?? TEXTS.loading[locale]}
      </CustomText>
    </View>
  );
};
