import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BillingFormModal } from '@/components/billing-info/BillingFormModal';
import type { UserBillingInfo } from '@/types/types';
import type { BillingSchemaType } from '@/utils/schemas/billingSchemas';

export default function BillingModal() {
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
    router.back();
  };

  const handleSuccess = () => {
    router.back();
    // TODO: Refrescar lista de billing info en la pantalla anterior
  };

  return (
    <SafeAreaView
      className='flex-1 bg-white'
      edges={['bottom']}
    >
      <View className='flex-1'>
        <BillingFormModal
          onClose={handleClose}
          onSuccess={handleSuccess}
          billingToEdit={billingToEdit}
        />
      </View>
    </SafeAreaView>
  );
}
