import { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { CustomText } from '@/components/ui/CustomText';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { FontAwesomeIcon } from '@/components/ui/FontAwesomeIcon';
import type { UserBillingInfo } from '@/types/types';

export default function BillingInfoScreen() {
  const { t, locale } = useTranslation();
  const [billingRecords, setBillingRecords] = useState<UserBillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    router.push('/(modals)/billing-modal');
  };

  const handleEdit = (billing: UserBillingInfo) => {
    console.log('✏️ Editar billing:', billing.id);

    // Navegar al modal con datos para editar
    router.push({
      pathname: '/(modals)/billing-modal',
      params: {
        billingData: JSON.stringify(billing),
      },
    });
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
        <View className='flex-1 items-center justify-center p-6'>
          <FontAwesomeIcon
            name='file-invoice-dollar'
            size={64}
            color='#CCC'
            variant='light'
          />
          <CustomText
            type='h2'
            className='mb-2 mt-6 text-center text-black'
          >
            {t('screens.billingInfo.noBillingYet')}
          </CustomText>
          <CustomText
            type='body'
            className='mb-8 text-center'
          >
            {t('screens.billingInfo.noBillingSubtitle')}
          </CustomText>
          <Button
            mode='primary'
            onPress={handleAddBilling}
            disabled={refreshing}
          >
            {t('screens.billingInfo.addNew')}
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
              <View
                key={billing.id}
                className='border-gray-200 rounded-lg border-2 bg-white p-4'
              >
                {/* Header con label */}
                <View className='mb-3 flex-row items-center justify-between'>
                  <View className='flex-row items-center gap-2'>
                    <FontAwesomeIcon
                      name='file-invoice'
                      size={20}
                      color='#d75639'
                      variant='light'
                    />
                    <CustomText
                      type='h3'
                      className='text-cinnabar'
                    >
                      {billing.label}
                    </CustomText>
                  </View>
                </View>

                {/* Información */}
                <View className='space-y-2'>
                  <View>
                    <CustomText
                      type='subtitle'
                      className='text-gray-500'
                    >
                      {t('screens.billingInfo.billingName')}:
                    </CustomText>
                    <CustomText
                      type='body'
                      className='text-black'
                    >
                      {billing.billingName}
                    </CustomText>
                  </View>

                  <View>
                    <CustomText
                      type='subtitle'
                      className='text-gray-500'
                    >
                      {t('screens.billingInfo.billingAddress')}:
                    </CustomText>
                    <CustomText
                      type='body'
                      className='text-black'
                    >
                      {billing.billingAddress}
                    </CustomText>
                  </View>

                  <View>
                    <CustomText
                      type='subtitle'
                      className='text-gray-500'
                    >
                      {t('screens.billingInfo.vatNumber')}:
                    </CustomText>
                    <CustomText
                      type='body'
                      className='text-black'
                    >
                      {billing.vatNumber}
                    </CustomText>
                  </View>
                </View>

                {/* Botones de acción */}
                <View className='mt-4 flex-row gap-2'>
                  <TouchableOpacity
                    onPress={() => handleEdit(billing)}
                    className='flex-1 items-center rounded-lg bg-blue-500 py-3'
                    disabled={refreshing}
                  >
                    <CustomText
                      type='body'
                      className='font-semibold text-white'
                    >
                      {t('screens.billingInfo.edit')}
                    </CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(billing)}
                    className='flex-1 items-center rounded-lg bg-red-500 py-3'
                    disabled={refreshing}
                  >
                    <CustomText
                      type='body'
                      className='font-semibold text-white'
                    >
                      {t('screens.billingInfo.delete')}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
