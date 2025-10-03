import * as Sentry from '@sentry/react-native';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock de Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('sentry-error-report', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Sentry.captureException with Error', () => {
    const error = new Error('Test error');

    sentryErrorReport(error, 'test-context');

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should handle error without context', () => {
    const error = new Error('Simple error');

    sentryErrorReport(error);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should handle string errors', () => {
    const stringError = 'String error message';

    sentryErrorReport(stringError, 'string-context');

    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle object errors', () => {
    const objectError = { message: 'Object error', code: 500 };

    sentryErrorReport(objectError, 'object-context');

    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should not throw when called', () => {
    const error = new Error('Test error');

    expect(() => {
      sentryErrorReport(error);
    }).not.toThrow();
  });

  it('should handle undefined errors', () => {
    expect(() => {
      sentryErrorReport(undefined);
    }).not.toThrow();
  });
});
