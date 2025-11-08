import { View, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { EmptyAddressState } from '@/components/addresses/EmptyAddressState';
import { AddressCard } from '@/components/addresses/AddressCard';
import { COUNTRIES_MAP_LABEL } from '@/constants/payment';
import type { UserAddress, CountryValue } from '@/types/types';

export default function AddressesScreen() {
  const { t, locale } = useTranslation();
  const { secureGet } = useSecureApi();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await secureGet<UserAddress[]>({
        endpoint: SECURE_ENDPOINTS.USER.ADDRESSES,
      });

      if (response.error) {
        console.error('Error from API:', response.error);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Network error loading addresses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [secureGet]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = () => {
    setModalVisible(true);
  };

  const handleDelete = (address: UserAddress) => {
    console.log('Delete address request:', address.id);
    console.log('Data:', address.nameAddress, '-', address.address);

    setAddresses((prev) => prev.filter((a) => a.id !== address.id));

    console.log('Address deleted successfully');
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

  if (loading) {
    return <Loading locale={locale} />;
  }

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
          <View className='mb-6'>
            <Button
              mode='primary'
              onPress={handleAddAddress}
              disabled={refreshing}
            >
              {t('screens.addresses.addNew')}
            </Button>
          </View>

          <View className='gap-4'>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                countryLabel={getCountryLabel(address.country)}
                onDelete={handleDelete}
                disabled={refreshing}
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
