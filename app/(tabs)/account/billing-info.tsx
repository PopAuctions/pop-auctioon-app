import { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/i18n/useTranslation';
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
  const [billingRecords, setBillingRecords] = useState<UserBillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [billingToEdit, setBillingToEdit] = useState<
    (BillingSchemaType & { id?: string }) | undefined
  >(undefined);

  const loadBillingInfo = useCallback(async () => {
    try {
      // TODO: Conectar con API endpoint SECURE_ENDPOINTS.BILLING.LIST
      console.log('📋 Cargando billing information...');

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: const response = await secureGet<UserBillingInfo[]>({ endpoint: SECURE_ENDPOINTS.BILLING.LIST });

      // Datos de ejemplo mientras conectamos la API
      const mockData: UserBillingInfo[] = [
        {
          id: '1',
          userId: 'user123',
          label: 'Empresa Principal',
          billingName: 'Tech Solutions SA de CV',
          billingAddress: 'Av. Reforma 123, Col. Centro, CDMX',
          vatNumber: 'TSO123456ABC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setBillingRecords(mockData);

      console.log('✅ Billing info cargada:', mockData.length, 'registros');
    } catch (error) {
      console.error('❌ Error cargando billing info:', error);
      // TODO: Mostrar toast con error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  const handleDelete = (billing: UserBillingInfo) => {
    console.log('🗑️ Solicitud de eliminar billing:', billing.id);
    console.log('📋 Datos:', billing.label, '-', billing.billingName);
    // TODO: Mostrar confirmación con modal personalizado

    // Simular eliminación directa por ahora
    console.log('⚠️ Eliminando billing:', billing.id);
    // TODO: Conectar con API endpoint SECURE_ENDPOINTS.BILLING.DELETE
    // const response = await securePost({ endpoint: SECURE_ENDPOINTS.BILLING.DELETE, data: { id: billing.id } });

    // Simular eliminación
    setBillingRecords((prev) => prev.filter((b) => b.id !== billing.id));

    console.log(
      '✅',
      locale === 'es' ? 'Información eliminada' : 'Information deleted'
    );
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
