import * as Sentry from '@sentry/react-native';

export function sentryErrorReport(error: unknown, context?: string) {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error);

  const exception =
    error instanceof Error
      ? error
      : new Error(`[${context ?? 'Error'}] ${message}`);
  Sentry.captureException(exception);
}
