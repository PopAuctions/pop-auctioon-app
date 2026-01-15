import { useState } from 'react';
import { View } from 'react-native';
import { ChangePriceModal } from '@/components/modal/ChangePriceModal';
import { CustomLink } from '@/components/ui/CustomLink';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  ArticleSecondChanceStatus,
  Lang,
  LangMap,
  RefetchReturn,
} from '@/types/types';
import { ConfirmModal } from '../modal/ConfirmModal';
import { useRouter } from 'expo-router';

const DESCRIPTIONS = {
  es: {
    remove:
      'Si el artículo ya no está disponible, por favor elimínalo de la tienda.',
    changePrice:
      'Cambia el precio del artículo siempre y cuando no tenga ninguna oferta.',
    noDecimalsText: 'El precio no puede tener decimales.',
    assignToAuction:
      'Puedes asignar el artículo a una subasta que esté en estado "Disponible".',
  },
  en: {
    remove:
      'If the article is no longer available, please remove it from the store.',
    changePrice:
      'Change the price of the article as long as it does not have any offers.',
    noDecimalsText: 'The price cannot have decimals.',
    assignToAuction:
      'You can assign the article to an auction that is in "Available" status.',
  },
};

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
  const [isChangePriceModalOpen, setChangePriceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { callToast } = useToast(locale);
  const { securePatch, secureDelete } = useSecureApi();
  const router = useRouter();

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
      return;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });

    setIsLoading(false);
    router.replace('/(tabs)/my-online-store');
    return;
  };

  return (
    <>
      <View className='-mx-1 w-full flex-row flex-wrap'>
        <View className='mb-2 w-1/2 px-1'>
          <CustomLink
            mode='primary'
            href={`/(tabs)/my-online-store/articles/${articleSecondChanceId}/rearrange-images`}
            isDisabled={isLoading}
          >
            {orderImages}
          </CustomLink>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <CustomLink
            mode='primary'
            href={`/(tabs)/my-online-store/articles/${articleSecondChanceId}/edit-images`}
            isDisabled={isLoading}
          >
            {editImages}
          </CustomLink>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <Button
            mode='primary'
            onPress={() => setChangePriceModalOpen(true)}
            disabled={isLoading}
          >
            {changePrice}
          </Button>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <Button
            mode='primary'
            onPress={() => setChangePriceModalOpen(true)}
            disabled={isLoading}
          >
            {assignToAuction}
          </Button>
        </View>
        <View className='mb-2 w-1/2 px-1'>
          <ConfirmModal
            mode='primary'
            onConfirm={handleRemoveArticle}
            title={{ es: 'Eliminar artículo', en: 'Remove article' }}
            description={{
              es: '¿Estás seguro de que quieres eliminar este artículo de la tienda online?',
              en: 'Are you sure you want to remove this article from the online store?',
            }}
            locale={locale}
          >
            {remove}
          </ConfirmModal>
        </View>
      </View>

      <ChangePriceModal
        visible={isChangePriceModalOpen}
        onClose={() => setChangePriceModalOpen(false)}
        onConfirm={(newPrice: string) => handlePriceChange(newPrice)}
        title={{ es: 'Cambiar precio', en: 'Change price' }}
        description={{
          es: 'Solo puedrás cambiar el precio si el artículo no tiene ofertas.',
          en: 'You can only change the price if the article has no offers.',
        }}
        id='price'
        label={{
          es: 'Precio (€)',
          en: 'Price (€)',
        }}
        locale={locale}
        defaultValue={currentPrice.toString()}
        helperText={DESCRIPTIONS[locale].noDecimalsText}
        commissionValue={commissionValue}
      />
    </>
  );
};
