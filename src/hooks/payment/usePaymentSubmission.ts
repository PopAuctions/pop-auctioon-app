import { useCallback, useRef, useState } from 'react';

export function usePaymentSubmission() {
  const inProgress = useRef(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const runPaymentSubmission = useCallback(
    async (submit: () => Promise<void>) => {
      if (inProgress.current) return;

      inProgress.current = true;
      setIsSubmittingPayment(true);
      try {
        await submit();
      } finally {
        inProgress.current = false;
        setIsSubmittingPayment(false);
      }
    },
    []
  );

  return { isSubmittingPayment, runPaymentSubmission };
}
