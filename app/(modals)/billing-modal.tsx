import { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BillingFormModal } from '@/components/billing-info/BillingFormModal';
import type { UserBillingInfo } from '@/types/types';
import type { BillingSchemaType } from '@/utils/schemas/billingSchemas';

export default function BillingFormScreen() {
  const params = useLocalSearchParams<{ billingData?: string }>();
  const [billingToEdit, setBillingToEdit] = useState<
    (BillingSchemaType & { id?: string }) | undefined
  >(undefined);

  useEffect(() => {
    if (params.billingData) {
      try {
        const parsedBilling: UserBillingInfo = JSON.parse(params.billingData);

        // Convert UserBillingInfo to BillingSchemaType format
        setBillingToEdit({
          id: parsedBilling.id,
          label: parsedBilling.label || '',
          billingName: parsedBilling.billingName,
          billingAddress: parsedBilling.billingAddress,
          vatNumber: parsedBilling.vatNumber || '',
        });
      } catch (error) {
        console.error('❌ Error parsing billing data:', error);
      }
    }
  }, [params.billingData]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/account/billing-info');
    }
  };

  const handleSuccess = () => {
    // Cerrar modal y refrescar lista
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/account/billing-info');
    }
  };

  return (
    <View className='flex-1 bg-white'>
      <BillingFormModal
        visible={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        billingToEdit={billingToEdit}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
