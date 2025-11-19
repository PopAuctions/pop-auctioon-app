import { useState, useCallback, useEffect } from 'react';
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
import { useToast } from '@/hooks/useToast';

export default function BillingInfoScreen() {
  const { t, locale } = useTranslation();
  const { callToast } = useToast(locale);
  const {
    data: billingRecords,
    status,
    refetch,
    errorMessage: fetchError,
  } = useGetBilling();
  const {
    deleteBilling,
    status: deleteStatus,
    errorMessage: deleteError,
  } = useDeleteBilling();
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [billingToEdit, setBillingToEdit] = useState<
    (BillingSchemaType & { id?: string }) | undefined
  >(undefined);

  // Handle fetch error and delete status
  useEffect(() => {
    // Handle fetch error
    if (status === 'error' && fetchError) {
      callToast({
        variant: 'error',
        description: fetchError,
      });
    }

    // Handle delete success
    if (deleteStatus === 'success') {
      callToast({
        variant: 'success',
        description: {
          en: t('screens.billingInfo.deleteSuccess'),
          es: t('screens.billingInfo.deleteSuccess'),
        },
      });
      setDeletingId(null);
      refetch();
    } else if (deleteStatus === 'error' && deleteError) {
      callToast({
        variant: 'error',
        description: deleteError,
      });
      setDeletingId(null);
    }
  }, [status, fetchError, deleteStatus, deleteError, refetch, callToast, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const handleAddBilling = () => {
    setBillingToEdit(undefined);
    setModalVisible(true);
  };

  const handleEdit = (billing: UserBillingInfo) => {
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

  // Loading state - Solo mostrar si NO es un refresh manual
  const loading = status === 'loading' && !refreshing;

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
          <CustomText
            type='h1'
            className='text-center text-cinnabar'
          >
            {t('screens.billingInfo.title')}
          </CustomText>
          <View className='my-4 self-end'>
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
