import { View, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { CustomText } from '@/components/ui/CustomText';
import { CustomError } from '@/components/ui/CustomError';
import { REQUEST_STATUS } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { EmptyAddressState } from '@/components/addresses/EmptyAddressState';
import { AddressCard } from '@/components/addresses/AddressCard';
import { COUNTRIES_MAP_LABEL } from '@/constants/payment';
import type { CountryValue } from '@/types/types';

export default function AddressesScreen() {
  const { t, locale } = useTranslation();
  const { data: addresses, status, refetch, errorMessage } = useGetAddresses();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Refrescar cuando el screen vuelva al foco (ej: después de crear una dirección)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddAddress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    refetch(); // Refrescar direcciones después de crear una nueva
  };

  const getCountryLabel = (countryValue: string) => {
    return (
      COUNTRIES_MAP_LABEL[locale][countryValue as CountryValue] || countryValue
    );
  };

  // Loading state - Solo mostrar si NO es un refresh manual
  if (
    (status === REQUEST_STATUS.loading || status === REQUEST_STATUS.idle) &&
    !refreshing
  ) {
    return <Loading locale={locale} />;
  }

  // Error state (show error but allow retry)
  if (status === REQUEST_STATUS.error) {
    return (
      <CustomError
        customMessage={errorMessage}
        refreshRoute='/(tabs)/account/addresses'
      />
    );
  }

  // Empty state
  if (addresses.length === 0) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <EmptyAddressState
          onAddNew={handleAddAddress}
          disabled={refreshing}
        />

        <AddressFormModal
          visible={modalVisible}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <ScrollView
        className='flex-1'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className='p-6'>
          {/* Header */}
          <CustomText
            type='h1'
            className='text-center text-cinnabar'
          >
            {t('screens.addresses.title')}
          </CustomText>
          <View className='my-4 self-end'>
            <Button
              mode='primary'
              onPress={handleAddAddress}
              disabled={refreshing}
            >
              {t('screens.addresses.addNew')}
            </Button>
          </View>
          {/* Addresses List */}
          <View className='gap-4'>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                countryLabel={getCountryLabel(address.country)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <AddressFormModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </SafeAreaView>
  );
}
