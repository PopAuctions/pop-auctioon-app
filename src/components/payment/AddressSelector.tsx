/**
 * AddressSelector - Selector de dirección de envío con preview
 * Incluye:
 * - SelectField con lista de direcciones
 * - Botón "+" para agregar nueva dirección
 * - Preview de la dirección seleccionada con detalles completos
 */

import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { SelectField } from '@/components/fields/SelectField';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import type { CountryValue, UserAddress } from '@/types/types';

interface AddressSelectorProps {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  selectedAddress: UserAddress | undefined;
  onAddressChange: (addressId: string) => void;
  onAddNewAddress: () => void;
  countriesLabel: Record<string, Record<CountryValue, string>> | null;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  selectedAddress,
  onAddressChange,
  onAddNewAddress,
  countriesLabel,
}: AddressSelectorProps) {
  const { t, locale } = useTranslation();
  const paymentTranslations = t('screens.payment');

  return (
    <View className='mb-6'>
      <CustomText
        type='h3'
        className='mb-3 text-cinnabar'
      >
        {paymentTranslations.address}
      </CustomText>

      {/* Selector de dirección + botón "+" */}
      <View className='mb-3 flex-row items-center gap-3'>
        <View className='flex-1'>
          <SelectField
            name=''
            value={selectedAddressId || ''}
            options={
              addresses?.map((addr) => ({
                label: addr.nameAddress || `${addr.city}, ${addr.country}`,
                value: addr.id,
              })) || []
            }
            placeholder={paymentTranslations.selectAddress}
            formField={true}
            onChange={(value: string | null) => {
              if (value) onAddressChange(value);
            }}
          />
        </View>
        <Button
          mode='secondary'
          size='small'
          onPress={onAddNewAddress}
          className='aspect-square'
        >
          <FontAwesomeIcon
            variant='bold'
            name='plus'
            size={18}
            color='#d75639'
          />
        </Button>
      </View>

      {/* Preview de dirección seleccionada */}
      {selectedAddress && (
        <View className='mt-2 w-fit space-y-1 rounded bg-neutral-100 p-3'>
          <CustomText
            type='bodysmall'
            className='text-black'
          >
            <CustomText
              type='bodysmall'
              className='font-bold text-black'
            >
              {paymentTranslations.address}:
            </CustomText>{' '}
            {selectedAddress.address}
          </CustomText>
          <CustomText
            type='bodysmall'
            className='text-black'
          >
            <CustomText
              type='bodysmall'
              className='font-bold text-black'
            >
              {paymentTranslations.country}:
            </CustomText>{' '}
            {countriesLabel
              ? countriesLabel[locale]?.[
                  selectedAddress.country as CountryValue
                ] || selectedAddress.country
              : selectedAddress.country}
          </CustomText>
          <CustomText
            type='bodysmall'
            className='text-black'
          >
            <CustomText
              type='bodysmall'
              className='font-bold text-black'
            >
              {paymentTranslations.city}:
            </CustomText>{' '}
            {selectedAddress.city}
          </CustomText>
          <CustomText
            type='bodysmall'
            className='text-black'
          >
            <CustomText
              type='bodysmall'
              className='font-bold text-black'
            >
              {paymentTranslations.state}:
            </CustomText>{' '}
            {selectedAddress.state}
          </CustomText>
          <CustomText
            type='bodysmall'
            className='text-black'
          >
            <CustomText
              type='bodysmall'
              className='font-bold text-black'
            >
              {paymentTranslations.postalCode}:
            </CustomText>{' '}
            {selectedAddress.postalCode}
          </CustomText>
        </View>
      )}
    </View>
  );
}
