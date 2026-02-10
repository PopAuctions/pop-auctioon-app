import { useCallback, useEffect, useState } from 'react';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import {
  ActionResponse,
  LangMap,
  RequestStatus,
  CountryValue,
  PaymentShippingTax,
} from '@/types/types';

// Backend response format (diferentes nombres)
interface BackendPaymentConfig {
  taxPercentageArticles: number;
  taxForShipping: PaymentShippingTax;
  commissionsValue: {
    STANDARD: {
      PERCENTAGE: number;
      THRESHOLD: number | null;
      LABEL: string;
    };
  };
  countries: Record<string, { label: string; value: CountryValue }[]>;
  countriesLabel: Record<string, Record<CountryValue, string>>;
}

// Frontend format (nuestro hook retorna esto)
interface PaymentConfigData {
  commission: number;
  shippingTaxes: PaymentShippingTax | null;
  taxPercentage: number;
  countries: Record<string, CountryValue[]>;
  countriesLabel: Record<string, Record<CountryValue, string>>;
}

export const useFetchPaymentConfig = (): ActionResponse<PaymentConfigData> => {
  const [data, setData] = useState<PaymentConfigData>({
    commission: 0,
    shippingTaxes: null,
    taxPercentage: 0,
    countries: {},
    countriesLabel: {},
  });
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<LangMap | null>(null);
  const { secureGet } = useSecureApi();

  const fetchPaymentConfig = useCallback(async () => {
    try {
      setStatus('loading');

      const response = await secureGet<BackendPaymentConfig>({
        endpoint: SECURE_ENDPOINTS.PAYMENT.INFO,
      });

      if (response.error) {
        setStatus('error');
        setErrorMessage(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        setStatus('error');
        setErrorMessage({
          en: 'Payment configuration data is missing',
          es: 'Faltan los datos de configuración de pago',
        });
        return;
      }

      // Transform backend data to frontend format
      const transformedData: PaymentConfigData = {
        commission: response.data.commissionsValue.STANDARD.PERCENTAGE,
        shippingTaxes: response.data.taxForShipping,
        taxPercentage: response.data.taxPercentageArticles,
        // Transform countries from array of objects to array of values
        countries: Object.keys(response.data.countries).reduce(
          (acc, locale) => {
            acc[locale] = response.data!.countries[locale].map((c) => c.value);
            return acc;
          },
          {} as Record<string, CountryValue[]>
        ),
        countriesLabel: response.data.countriesLabel,
      };

      setData(transformedData);
      setStatus('success');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';

      sentryErrorReport(
        errorMsg,
        'USE_FETCH_PAYMENT_CONFIG - Unexpected error'
      );

      const message: LangMap = {
        en: 'Error fetching payment configuration data',
        es: 'Error al cargar la configuración de pago',
      };

      setStatus('error');
      setErrorMessage(message);
    }
  }, [secureGet]);

  useEffect(() => {
    fetchPaymentConfig();
  }, [fetchPaymentConfig]);
  return {
    data,
    status,
    errorMessage,
    setErrorMessage,
  };
};
