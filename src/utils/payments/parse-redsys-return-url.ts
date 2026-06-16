export interface RedsysPaymentError {
  code: string;
  message: string;
}

export type RedsysPaymentBrowserResult =
  | {
      success: true;
      type: 'success';
      redsysOrderId: string | null;
      returnUrl: string;
      status: 'ok';
    }
  | {
      success: false;
      type: 'cancel';
      redsysOrderId: string | null;
      error?: RedsysPaymentError;
    }
  | {
      success: false;
      type: 'error';
      redsysOrderId: string | null;
      error: RedsysPaymentError;
      returnUrl?: string;
      status?: 'ko';
    };

export const parseRedsysReturnUrl = ({
  url,
  expectedOrderId,
}: {
  url: string;
  expectedOrderId?: string | null;
}): RedsysPaymentBrowserResult => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      success: false,
      type: 'error',
      redsysOrderId: expectedOrderId ?? null,
      error: {
        code: 'INVALID_RETURN_URL',
        message: 'Invalid Redsys return URL',
      },
      returnUrl: url,
    };
  }

  const status = parsedUrl.searchParams.get('status');
  const returnedOrderId = parsedUrl.searchParams.get('order');
  const resolvedOrderId = returnedOrderId ?? expectedOrderId ?? null;

  if (
    expectedOrderId &&
    returnedOrderId &&
    expectedOrderId !== returnedOrderId
  ) {
    return {
      success: false,
      type: 'error',
      redsysOrderId: resolvedOrderId,
      error: {
        code: 'ORDER_MISMATCH',
        message: 'Returned order does not match initialized Redsys order',
      },
      returnUrl: url,
    };
  }

  if (status === 'ok') {
    return {
      success: true,
      type: 'success',
      redsysOrderId: resolvedOrderId,
      returnUrl: url,
      status: 'ok',
    };
  }

  if (status === 'ko') {
    return {
      success: false,
      type: 'error',
      redsysOrderId: resolvedOrderId,
      error: {
        code: 'PAYMENT_FAILED',
        message: 'Payment failed or was rejected in Redsys',
      },
      returnUrl: url,
      status: 'ko',
    };
  }

  return {
    success: false,
    type: 'error',
    redsysOrderId: resolvedOrderId,
    error: {
      code: 'INVALID_PAYMENT_STATUS',
      message: 'Redsys return URL is missing a valid status',
    },
    returnUrl: url,
  };
};
