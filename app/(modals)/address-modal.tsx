import { View, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AddressFormModal as AddressForm } from '@/components/addresses/AddressFormModal';
import { useTranslation } from '@/hooks/i18n/useTranslation';

export default function AddressFormScreen() {
  const { t } = useTranslation();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/account/addresses');
    }
  };

  const handleSuccess = () => {
    // Cerrar modal y refrescar lista
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/account/addresses');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('screens.addresses.addNew'),
        }}
      />
      <View className='flex-1 bg-white'>
        <AddressForm
          visible={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </>
  );
}
