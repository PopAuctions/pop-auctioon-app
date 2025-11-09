import { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyBillingState } from '@/components/billing-info/EmptyBillingState';
import { BillingCard } from '@/components/billing-info/BillingCard';
import { BillingFormModal } from '@/components/billing-info/BillingFormModal';
import type { UserBillingInfo } from '@/types/types';
import type { BillingSchemaType } from '@/utils/schemas/billingSchemas';

export default function BillingInfoScreen() {
  const { t, locale } = useTranslation();
  const { secureGet, secureDelete } = useSecureApi();
  const [billingRecords, setBillingRecords] = useState<UserBillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [billingToEdit, setBillingToEdit] = useState<
    (BillingSchemaType & { id?: string }) | undefined
  >(undefined);

  const loadBillingInfo = useCallback(async () => {
    try {
      const response = await secureGet<UserBillingInfo[]>({
        endpoint: SECURE_ENDPOINTS.USER.BILLING,
      });

      if (response.error) {
        console.error('❌ ERROR_LOAD_BILLING:', response.error);
        // TODO: Show toast with response.error[locale]
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setBillingRecords(response.data);
        console.log('✅ Billing info loaded:', response.data.length, 'records');
      }
    } catch (error) {
      console.error('❌ ERROR_LOAD_BILLING_CATCH:', error);
      // TODO: Show toast with generic error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [secureGet]);

  useEffect(() => {
    loadBillingInfo();
  }, [loadBillingInfo]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBillingInfo();
  }, [loadBillingInfo]);

  const handleAddBilling = () => {
    setBillingToEdit(undefined);
    setModalVisible(true);
  };

  const handleEdit = (billing: UserBillingInfo) => {
    console.log('✏️ Editar billing:', billing.id);

    // Convert UserBillingInfo to BillingSchemaType format
    setBillingToEdit({
      id: billing.id,
      label: billing.label || '',
      billingName: billing.billingName,
      billingAddress: billing.billingAddress,
      vatNumber: billing.vatNumber || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (billing: UserBillingInfo) => {
    // TODO: Show confirmation modal
    setDeletingId(billing.id);
    try {
      const response = await secureDelete({
        endpoint: SECURE_ENDPOINTS.USER.BILLING_BY_ID(billing.id),
      });

      if (response.error) {
        console.error('❌ ERROR_DELETE_BILLING:', response.error);
        // TODO: Show toast with response.error[locale]
        return;
      }

      // Success - remove from local state
      setBillingRecords((prev) => prev.filter((b) => b.id !== billing.id));
      console.log('✅ Billing deleted successfully');
      // TODO: Show success toast
    } catch (error) {
      console.error('❌ ERROR_DELETE_BILLING_CATCH:', error);
      // TODO: Show toast with generic error
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setBillingToEdit(undefined);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setBillingToEdit(undefined);
    loadBillingInfo(); // Refresh list
  };

  // Loading state
  if (loading) {
    return <Loading locale={locale} />;
  }

  // Empty state
  if (billingRecords.length === 0) {
    return (
      <SafeAreaView
        className='flex-1 bg-white'
        edges={['bottom']}
      >
        <EmptyBillingState
          onAddNew={handleAddBilling}
          disabled={refreshing}
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
              {t('screens.billingInfo.title')}
            </CustomText>
            <Button
              mode='primary'
              onPress={handleAddBilling}
              disabled={refreshing}
            >
              {t('screens.billingInfo.addNew')}
            </Button>
          </View>

          {/* Billing Records Grid */}
          <View className='gap-4'>
            {billingRecords.map((billing) => (
              <BillingCard
                key={billing.id}
                billing={billing}
                onEdit={handleEdit}
                onDelete={handleDelete}
                disabled={refreshing}
                isDeleting={deletingId === billing.id}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <BillingFormModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        billingToEdit={billingToEdit}
      />
    </SafeAreaView>
  );
}
