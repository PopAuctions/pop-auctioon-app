import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_RESULT_CONTEXT_KEY = 'payment_result_context_v1';

export interface PaymentResultContext {
  retryRoute: string;
  flow: 'auction' | 'single';
  paymentId?: number;
  paymentIntent?: string;
}

export const savePaymentResultContext = async (
  context: PaymentResultContext
) => {
  await AsyncStorage.setItem(
    PAYMENT_RESULT_CONTEXT_KEY,
    JSON.stringify(context)
  );
};

export const getPaymentResultContext = async (): Promise<PaymentResultContext | null> => {
  const raw = await AsyncStorage.getItem(PAYMENT_RESULT_CONTEXT_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as PaymentResultContext;
  } catch {
    await AsyncStorage.removeItem(PAYMENT_RESULT_CONTEXT_KEY);
    return null;
  }
};

export const clearPaymentResultContext = async () => {
  await AsyncStorage.removeItem(PAYMENT_RESULT_CONTEXT_KEY);
};
