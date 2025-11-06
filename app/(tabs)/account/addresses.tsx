import { View, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import { Loading } from '@/components/ui/Loading';
import { COUNTRIES_MAP_LABEL } from '@/constants/payment';
import type { UserAddress, CountryValue } from '@/types/types';

export default function AddressesScreen() {
  const { t, locale } = useTranslation();
  const { secureGet } = useSecureApi();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const response = await secureGet<UserAddress[]>(
        SECURE_ENDPOINTS.USER.ADDRESSES
      );

      if (response.error) {
        console.error('❌ Error from API:', response.error);
        // TODO: Mostrar toast con el error
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('❌ Network error loading addresses:', error);
      // TODO: Mostrar toast genérico
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
    router.push('/(modals)/address-modal');
  };

  const getCountryLabel = (countryValue: string) => {
    return (
      COUNTRIES_MAP_LABEL[locale][countryValue as CountryValue] || countryValue
    );
  };

  // Loading state
  if (loading) {
    return <Loading locale={locale} />;
  }

  // Empty state
  if (!loading && addresses.length === 0) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <View className='flex-1 items-center justify-center p-6'>
          <FontAwesomeIcon
            name='location-dot'
            size={64}
            color='#CCC'
            variant='light'
          />
          <CustomText
            type='h2'
            className='mb-2 mt-6 text-center text-black'
          >
            {t('screens.addresses.noAddressesYet')}
          </CustomText>
          <CustomText
            type='body'
            className='mb-8 text-center'
          >
            {t('screens.addresses.subtitle')}
          </CustomText>
          <Button
            mode='primary'
            onPress={handleAddAddress}
            disabled={refreshing}
          >
            {t('screens.addresses.addNew')}
          </Button>
        </View>
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

          {/* Addresses Grid */}
          <View className='gap-4'>
            {addresses.map((address) => (
              <View
                key={address.id}
                className='border-gray-200 rounded-3xl border bg-white p-4 shadow-sm'
              >
                {/* Header with name and primary badge */}
                <View className='mb-3 flex-row items-start justify-between'>
                  <CustomText
                    type='h3'
                    className='flex-1 font-bold text-black'
                  >
                    {address.nameAddress ||
                      (locale === 'es' ? 'Sin nombre' : 'No name')}
                  </CustomText>
                  {address.primaryAddress && (
                    <CustomText
                      type='bold'
                      className='ml-2 text-xl'
                    >
                      {t('screens.addresses.primaryAddress')}
                    </CustomText>
                  )}
                </View>

                {/* Address details with labels */}
                <View className='gap-2'>
                  {/* Address */}
                  <View>
                    <CustomText
                      type='body'
                      className='font-bold text-black'
                    >
                      {t('screens.addresses.form.address')}:{' '}
                      <CustomText
                        type='body'
                        className='font-normal'
                      >
                        {address.address}
                      </CustomText>
                    </CustomText>
                  </View>

                  {/* City */}
                  <View>
                    <CustomText
                      type='body'
                      className='font-bold text-black'
                    >
                      {t('screens.addresses.form.city')}:{' '}
                      <CustomText
                        type='body'
                        className='font-normal'
                      >
                        {address.city}
                      </CustomText>
                    </CustomText>
                  </View>

                  {/* State/Province */}
                  <View>
                    <CustomText
                      type='body'
                      className='font-bold text-black'
                    >
                      {t('screens.addresses.form.state')}:{' '}
                      <CustomText
                        type='body'
                        className='font-normal'
                      >
                        {address.state}
                      </CustomText>
                    </CustomText>
                  </View>

                  {/* Postal Code */}
                  <View>
                    <CustomText
                      type='body'
                      className='font-bold text-black'
                    >
                      {t('screens.addresses.form.postalCode')}:{' '}
                      <CustomText
                        type='body'
                        className='font-normal'
                      >
                        {address.postalCode}
                      </CustomText>
                    </CustomText>
                  </View>

                  {/* Country */}
                  <View>
                    <CustomText
                      type='body'
                      className='font-bold text-black'
                    >
                      {t('screens.addresses.form.country')}:{' '}
                      <CustomText
                        type='body'
                        className='font-normal'
                      >
                        {getCountryLabel(address.country)}
                      </CustomText>
                    </CustomText>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Add button at bottom */}
          <View className='mt-6'>
            <Button
              mode='secondary'
              onPress={handleAddAddress}
              disabled={refreshing}
            >
              {t('screens.addresses.addNew')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
