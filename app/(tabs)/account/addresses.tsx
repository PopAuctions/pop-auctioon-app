import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
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
      const response = await secureGet<{ addresses: UserAddress[] }>(
        '/user/addresses'
      );

      if (response.data?.addresses) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
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
            <View className='flex-1'>
              <CustomText
                type='h1'
                className='mb-1 text-black'
              >
                {t('screens.addresses.title')}
              </CustomText>
              <CustomText type='subtitle'>
                {t('screens.addresses.subtitle')}
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={handleAddAddress}
              className='ml-4'
            >
              <FontAwesomeIcon
                name='plus'
                size={24}
                color='#E63946'
                variant='bold'
              />
            </TouchableOpacity>
          </View>

          {/* Addresses Grid */}
          <View className='gap-4'>
            {addresses.map((address) => (
              <View
                key={address.id}
                className='border-gray-200 rounded-lg border bg-white p-4 shadow-sm'
              >
                {/* Header with name and primary badge */}
                <View className='mb-3 flex-row items-start justify-between'>
                  <CustomText
                    type='subtitle'
                    className='flex-1 font-bold text-black'
                  >
                    {address.nameAddress}
                  </CustomText>
                  {address.primaryAddress && (
                    <View className='ml-2 rounded bg-cinnabar px-2 py-1'>
                      <CustomText
                        type='bodysmall'
                        className='font-bold text-white'
                      >
                        {t('screens.addresses.primaryAddress')}
                      </CustomText>
                    </View>
                  )}
                </View>

                {/* Address details */}
                <View className='gap-1'>
                  <CustomText type='body'>{address.address}</CustomText>
                  <CustomText type='body'>
                    {address.city}, {address.state} {address.postalCode}
                  </CustomText>
                  <CustomText type='body'>
                    {getCountryLabel(address.country)}
                  </CustomText>
                </View>
              </View>
            ))}
          </View>

          {/* Add button at bottom */}
          <View className='mt-6'>
            <Button
              mode='secondary'
              onPress={handleAddAddress}
            >
              {t('screens.addresses.addNew')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
