import { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import {
  useGetBilling,
  useDeleteBilling,
} from '@/hooks/pages/billing/useBilling';
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
  const { data: billingRecords, status, refetch } = useGetBilling();
  const { deleteBilling, status: deleteStatus } = useDeleteBilling();
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [billingToEdit, setBillingToEdit] = useState<
    (BillingSchemaType & { id?: string }) | undefined
  >(undefined);

  // Track previous delete status to avoid loop
  const prevDeleteStatusRef = useRef<typeof deleteStatus>('idle');

  // Handle delete success
  useEffect(() => {
    // Only refetch when status changes from loading to success
    if (
      deleteStatus === 'success' &&
      prevDeleteStatusRef.current === 'loading'
    ) {
      console.log('✅ Billing deleted successfully');
      // TODO: Show success toast
      setDeletingId(null);
      refetch(); // Refresh list after delete
    } else if (
      deleteStatus === 'error' &&
      prevDeleteStatusRef.current === 'loading'
    ) {
      console.error('❌ Delete billing failed');
      // TODO: Show error toast
      setDeletingId(null);
    }

    prevDeleteStatusRef.current = deleteStatus;
  }, [deleteStatus, refetch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

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
    await deleteBilling(billing.id);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setBillingToEdit(undefined);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setBillingToEdit(undefined);
    refetch(); // Refresh list
  };

  // Loading state
  const loading = status === 'loading';

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
                disabled={refreshing || deleteStatus === 'loading'}
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
