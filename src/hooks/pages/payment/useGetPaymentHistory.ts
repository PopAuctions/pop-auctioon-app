// import { useSecureApi } from '@/hooks/api/useSecureApi';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
// import { SECURE_ENDPOINTS } from '@/config/api-config';
import type {
  ActionResponse,
  LangMap,
  RequestStatus,
  UserPayment,
} from '@/types/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para obtener el historial de pagos del usuario
 * Simula la llamada al endpoint hasta que esté implementado en el backend
 */
export const useGetPaymentHistory = (): ActionResponse<UserPayment[]> & {
  refetch: () => Promise<void>;
} => {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  // const { secureGet } = useSecureApi(); // TODO: Descomentar cuando exista el endpoint

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setStatus('loading');

      // TODO: Implementar endpoint en backend
      // const response = await secureGet<UserPayment[]>({
      //   endpoint: SECURE_ENDPOINTS.USER.PAYMENT_HISTORY,
      // });

      // SIMULACIÓN TEMPORAL - Reemplazar cuando exista el endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data para desarrollo
      const mockPayments: UserPayment[] = [
        {
          id: 1,
          createdAt: '2025-10-08T06:43:00Z',
          status: 'APPROVED',
          totalAmount: 235.0,
          articlesPaid: [1],
          auction: null,
          articles: [
            {
              id: 1,
              title: 'Elegant Black Handbag',
              auctionId: 0,
              soldPrice: 235.0,
              brand: 'Prada',
              images: [
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300',
              ],
            },
          ],
          user: {},
        },
        {
          id: 2,
          createdAt: '2025-05-26T04:58:00Z',
          status: 'APPROVED',
          totalAmount: 10094.5,
          articlesPaid: [2, 3],
          auction: {
            id: 5,
            title: 'April auction',
            startDate: new Date('2025-04-15'),
          },
          articles: [
            {
              id: 2,
              title: 'Louis Vuitton Handbag',
              auctionId: 5,
              soldPrice: 5000.0,
              brand: 'Louis Vuitton',
              images: [
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
              ],
            },
            {
              id: 3,
              title: 'Designer Wallet',
              auctionId: 5,
              soldPrice: 5094.5,
              brand: 'Gucci',
              images: [
                'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300',
              ],
            },
          ],
          user: {},
        },
      ];

      // Simular respuesta exitosa
      setPayments(mockPayments);
      setStatus('success');

      // Si el endpoint falla (cuando esté implementado):
      // if (response.error) {
      //   console.error('ERROR_LOAD_PAYMENT_HISTORY', response.error);
      //   setStatus('error');
      //   setErrorMessage(response.error);
      //   return;
      // }

      // if (response.data && Array.isArray(response.data)) {
      //   setPayments(response.data);
      //   setStatus('success');
      // } else {
      //   setPayments([]);
      //   setStatus('success');
      // }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(errorMsg, 'USE_GET_PAYMENT_HISTORY - Unexpected error');

      console.error('ERROR_LOAD_PAYMENT_HISTORY_CATCH', errorMsg);

      setStatus('error');
      setErrorMessage({
        en: 'Error loading payment history',
        es: 'Error al cargar el historial de pagos',
      });
    }
  }, []);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    data: payments,
    status,
    errorMessage,
    setErrorMessage,
    refetch: fetchPaymentHistory,
  };
};
