import {
  ArticleSecondChanceStatus,
  Lang,
  LangMap,
  RefetchReturn,
} from '@/types/types';
import { ChangePriceModal } from '@/components/modal/ChangePriceModal';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';

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
  const { callToast } = useToast(locale);
  const { securePatch } = useSecureApi();

  const handlePriceChange = async (newPrice: string) => {
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
      return false;
    }

    callToast({
      variant: 'success',
      description: response.data,
    });
    refetch();

    return true;
  };

  return (
    <>
      <View>
        <Button
          mode='primary'
          onPress={() => setChangePriceModalOpen(true)}
        >
          {changePrice}
        </Button>
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
