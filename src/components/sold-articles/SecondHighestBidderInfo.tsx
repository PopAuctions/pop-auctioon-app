import { useState } from 'react';
import { View } from 'react-native';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { CustomText } from '@/components/ui/CustomText';
import { Lang, LangMap } from '@/types/types';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';

interface SecondHighestBidderInfoProps {
  articleId: string | number;
  locale: Lang;
  texts: {
    secondUser: string;
    grantToSecondUser: string;
  };
  secondHighestBidUser: {
    username: string;
    name: string;
    lastName: string;
  };
}

export const SecondHighestBidderInfo = ({
  articleId,
  locale,
  texts,
  secondHighestBidUser,
}: SecondHighestBidderInfoProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { securePost } = useSecureApi();
  const { callToast } = useToast(locale);

  const handleGrantToSecondUser = async () => {
    setIsLoading(true);
    try {
      const response = await securePost<LangMap>({
        endpoint:
          SECURE_ENDPOINTS['SOLD-ARTICLES'].GRANT_TO_SECOND_BIDDER(articleId),
      });

      if (response.error) {
        callToast({ variant: 'error', description: response.error });
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='gap-3'>
      <CustomText
        type='subtitle'
        className='text-center text-xl text-cinnabar'
      >
        {texts.secondUser}
      </CustomText>

      <View className='items-center'>
        <CustomText
          type='h4'
          className='text-center'
        >
          {secondHighestBidUser.username}
        </CustomText>
        <CustomText
          type='h4'
          className='text-center'
        >
          {secondHighestBidUser.name} {secondHighestBidUser.lastName}
        </CustomText>
      </View>

      <View className='items-center'>
        <ConfirmModal
          mode='primary'
          onConfirm={handleGrantToSecondUser}
          isDisabled={isLoading}
          title={{
            es: 'Otorgar a segundo mayor postor',
            en: 'Grant to second highest bidder',
          }}
          description={{
            es: '¿Está seguro de que desea otorgar el artículo al segundo mayor postor?',
            en: 'Are you sure you want to grant the article to the second highest bidder?',
          }}
          importantMessage={{
            es: 'No podrás revertir esta acción.',
            en: 'You will not be able to revert this action.',
          }}
          locale={locale}
        >
          {texts.grantToSecondUser}
        </ConfirmModal>
      </View>
    </View>
  );
};
