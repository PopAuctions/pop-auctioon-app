import { View, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useGetAddresses } from '@/hooks/pages/address/useGetAddresses';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { Loading } from '@/components/ui/Loading';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { EmptyAddressState } from '@/components/addresses/EmptyAddressState';
import { AddressCard } from '@/components/addresses/AddressCard';
import { COUNTRIES_MAP_LABEL } from '@/constants/payment';
import type { CountryValue } from '@/types/types';

export default function AddressesScreen() {
  const { t, locale } = useTranslation();
  const { data: addresses, status, refetch } = useGetAddresses();
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
    loadAddresses();
  };

  const getCountryLabel = (countryValue: string) => {
    return (
      COUNTRIES_MAP_LABEL[locale][countryValue as CountryValue] || countryValue
    );
  };

  // Loading state
  if (status === 'loading' || status === 'idle') {
    return <Loading locale={locale} />;
  }

  // Error state (show error but allow retry)
  if (status === 'error') {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <View className='flex-1 items-center justify-center p-6'>
          <FontAwesomeIcon
            name='exclamation-triangle'
            size={64}
            color='#C1463D'
            variant='light'
          />
          <CustomText
            type='h2'
            className='mb-2 mt-6 text-center text-cinnabar'
          >
            {locale === 'es' ? 'Error al cargar' : 'Error loading'}
          </CustomText>
          <CustomText
            type='body'
            className='mb-8 text-center'
          >
            {locale === 'es'
              ? 'No se pudieron cargar las direcciones'
              : 'Could not load addresses'}
          </CustomText>
          <Button
            mode='primary'
            onPress={onRefresh}
            disabled={refreshing}
          >
            {locale === 'es' ? 'Reintentar' : 'Retry'}
          </Button>
        </View>
      </SafeAreaView>
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
          <View className='mb-6 flex-row items-center justify-between'>
            <CustomText
              type='h1'
              className='flex-1 text-cinnabar'
            >
              {t('screens.addresses.title')}
            </CustomText>
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
