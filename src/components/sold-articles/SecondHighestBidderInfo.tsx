import { useState } from 'react';
import { View } from 'react-native';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { CustomText } from '@/components/ui/CustomText';
import { Lang, LangMap } from '@/types/types';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { useTranslation } from '@/hooks/i18n/useTranslation';

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
  const { t } = useTranslation();
  const modalTexts = t('components.modals.soldArticle', { locale });
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
          title={modalTexts.grantSecondTitle}
          description={modalTexts.grantSecondDescription}
          importantMessage={modalTexts.importantMessage}
        >
          {texts.grantToSecondUser}
        </ConfirmModal>
      </View>
    </View>
  );
};
