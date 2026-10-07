import { useState } from 'react';
import { View } from 'react-native';
import { ChangePriceModal } from '@/components/modal/ChangePriceModal';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { AssignToAuctionModal } from '@/components/modal/AssignToAuctionModal';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  ArticleSecondChanceStatus,
  Lang,
  LangMap,
  RefetchReturn,
} from '@/types/types';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export const ArticleDetailsActions = ({
  TEXTS: { assignToAuction, remove, changePrice, orderImages, editImages },
  articleSecondChanceId,
  currentPrice,
  locale,
  currentStatus,
  commissionValue,
  refetch,
}: {
  TEXTS: {
    assignToAuction: string;
    remove: string;
    changePrice: string;
    orderImages: string;
    editImages: string;
  };
  articleSecondChanceId: number;
  currentPrice: number;
  locale: Lang;
  currentStatus: ArticleSecondChanceStatus;
  commissionValue: number | null;
  refetch: () => RefetchReturn;
}) => {
  const { t } = useTranslation();
  const modalTexts = t('components.modals.onlineStoreArticle', { locale });
  const [isChangePriceModalOpen, setChangePriceModalOpen] = useState(false);
  const [isAssignToAuctionModalOpen, setAssignToAuctionModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { callToast } = useToast(locale);
  const { securePatch, secureDelete, securePost } = useSecureApi();
  const { navigateWithAuth } = useAuthNavigation();

  const handlePriceChange = async (newPrice: string) => {
    setIsLoading(true);
    const response = await securePatch<LangMap>({
      endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.UPDATE_PRICE(
        articleSecondChanceId
      ),
      data: {
        price: newPrice,
      },
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      setIsLoading(false);
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
    refetch();
    setIsLoading(false);
    return true;
  };

  const handleAssignToAuction = async (auctionId: string, price: string) => {
    setIsLoading(true);
    const response = await securePost<LangMap>({
      endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.CHAGE_TO_AUCTION(
        articleSecondChanceId
      ),
      data: {
        price: price,
        auctionId: auctionId,
      },
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      setIsLoading(false);
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
    navigateWithAuth('/(tabs)/auctioneer/my-online-store');
    setIsLoading(false);

    return true;
  };

  const handleRemoveArticle = async () => {
    setIsLoading(true);
    const response = await secureDelete<LangMap>({
      endpoint: SECURE_ENDPOINTS.MY_ONLINE_STORE.DELETE(articleSecondChanceId),
    });

    if (response.error) {
      callToast({
        variant: 'error',
        description: response.error,
      });
      setIsLoading(false);
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });

    setIsLoading(false);
    navigateWithAuth('/(tabs)/auctioneer/my-online-store');
    return true;
  };

  return (
    <>
      <View className='-mx-1 mt-2 w-full flex-row flex-wrap'>
        <View className='mb-2 w-1/2 px-1'>
          <CustomLink
            mode='primary'
            href={`/(tabs)/auctioneer/my-online-store/articles/${articleSecondChanceId}/rearrange-images`}
            isDisabled={isLoading}
          >
            {orderImages}
          </CustomLink>
        </View>
        {/* <View className='mb-2 w-1/2 px-1'>
          <CustomLink
            mode='primary'
            href={`/(tabs)/auctioneer/my-online-store/articles/${articleSecondChanceId}/edit-images`}
            isDisabled={isLoading}
          >
            {editImages}
          </CustomLink>
        </View> */}
        <View className='mb-2 w-1/2 px-1'>
          <Button
            mode='primary'
            onPress={() => {
              setChangePriceModalOpen(true);
              setAssignToAuctionModalOpen(false);
            }}
            disabled={isLoading}
          >
            {changePrice}
          </Button>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <Button
            mode='primary'
            onPress={() => {
              setAssignToAuctionModalOpen(true);
              setChangePriceModalOpen(false);
            }}
            disabled={isLoading}
          >
            {assignToAuction}
          </Button>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <ConfirmModal
            mode='primary'
            onConfirm={handleRemoveArticle}
            title={modalTexts.removeTitle}
            isDisabled={isLoading}
            description={modalTexts.removeDescription}
          >
            {remove}
          </ConfirmModal>
        </View>
      </View>

      <AssignToAuctionModal
        id='selected-auction'
        visible={isAssignToAuctionModalOpen}
        onClose={() => setAssignToAuctionModalOpen(false)}
        onConfirm={handleAssignToAuction}
        title={modalTexts.assignTitle}
        description={modalTexts.assignDescription}
        defaultValue={currentPrice.toString()}
        helperText={modalTexts.noDecimals}
      />
      <ChangePriceModal
        id='price'
        visible={isChangePriceModalOpen}
        onClose={() => setChangePriceModalOpen(false)}
        onConfirm={handlePriceChange}
        title={modalTexts.changePriceTitle}
        description={modalTexts.changePriceDescription}
        label={modalTexts.priceLabel}
        defaultValue={currentPrice.toString()}
        helperText={modalTexts.noDecimals}
        commissionValue={commissionValue}
      />
    </>
  );
};
