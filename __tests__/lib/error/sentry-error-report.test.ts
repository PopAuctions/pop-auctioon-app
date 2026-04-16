import * as Sentry from '@sentry/react-native';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('sentryErrorReport', () => {
  const mockCaptureException = Sentry.captureException as jest.MockedFunction<
    typeof Sentry.captureException
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Object Handling', () => {
    it('should report Error object directly', () => {
      const error = new Error('Test error message');
      const context = 'Test context';

      sentryErrorReport(error, context);

      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should preserve Error stack trace', () => {
      const error = new Error('Error with stack');
      error.stack = 'Stack trace here';

      sentryErrorReport(error, 'Stack trace context');

      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error with stack',
          stack: 'Stack trace here',
        })
      );
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Type error message');

      sentryErrorReport(error, 'TypeError context');

      expect(mockCaptureException).toHaveBeenCalledWith(error);
      expect(mockCaptureException.mock.calls[0]?.[0]).toBeInstanceOf(TypeError);
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Reference error');

      sentryErrorReport(error, 'ReferenceError context');

      expect(mockCaptureException).toHaveBeenCalledWith(error);
      expect(mockCaptureException.mock.calls[0]?.[0]).toBeInstanceOf(
        ReferenceError
      );
    });

    it('should handle custom Error subclasses', () => {
      class CustomError extends Error {
        code: number;
        constructor(message: string, code: number) {
          super(message);
          this.code = code;
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error', 404);

      sentryErrorReport(error, 'Custom error context');

      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });
  });

  describe('String Error Handling', () => {
    it('should wrap string error in Error object', () => {
      const errorString = 'String error message';
      const context = 'String error context';

      sentryErrorReport(errorString, context);

      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[String error context] String error message'
      );
    });

    it('should handle empty string error', () => {
      const context = 'Empty string context';

      sentryErrorReport('', context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toBe('[Empty string context] ');
    });

    it('should handle string with special characters', () => {
      const errorString = 'Error: !@#$%^&*(){}[]|\\;:",.<>?/';
      const context = 'Special chars context';

      sentryErrorReport(errorString, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toContain(errorString);
    });
  });

  describe('Unknown Type Error Handling', () => {
    it('should wrap object error in Error with JSON string', () => {
      const errorObject = { custom: 'error', code: 500 };
      const context = 'Object error context';

      sentryErrorReport(errorObject, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[Object error context] {"custom":"error","code":500}'
      );
    });

    it('should wrap null error in Error object', () => {
      const context = 'Null error context';

      sentryErrorReport(null, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[Null error context] null'
      );
    });

    it('should wrap undefined error in Error object', () => {
      const context = 'Undefined error context';

      sentryErrorReport(undefined, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
    });

    it('should wrap numeric error in Error object', () => {
      const context = 'Numeric error context';

      sentryErrorReport(404, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[Numeric error context] 404'
      );
    });

    it('should wrap boolean error in Error object', () => {
      const context = 'Boolean error context';

      sentryErrorReport(false, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[Boolean error context] false'
      );
    });

    it('should wrap array error in Error object with JSON', () => {
      const errorArray = ['error1', 'error2'];
      const context = 'Array error context';

      sentryErrorReport(errorArray, context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect(capturedError).toBeInstanceOf(Error);
      expect((capturedError as Error).message).toBe(
        '[Array error context] ["error1","error2"]'
      );
    });
  });

  describe('Context Formatting', () => {
    it('should include context in error message for non-Error types', () => {
      const context = 'Specific context information';

      sentryErrorReport('Test error', context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toContain(context);
    });

    it('should handle empty context string', () => {
      sentryErrorReport('Test error', '');

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toBe('[] Test error');
    });

    it('should handle long context strings', () => {
      const context = 'A'.repeat(100);

      sentryErrorReport('Test', context);

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toContain(context);
    });

    it('should not modify Error object message when error is instanceof Error', () => {
      const originalMessage = 'Original error message';
      const error = new Error(originalMessage);

      sentryErrorReport(error, 'Some context');

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toBe(originalMessage);
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple sequential calls', () => {
      sentryErrorReport(new Error('Error 1'), 'Context 1');
      sentryErrorReport(new Error('Error 2'), 'Context 2');
      sentryErrorReport('String error', 'Context 3');

      expect(mockCaptureException).toHaveBeenCalledTimes(3);
    });

    it('should create independent Error objects for each call', () => {
      sentryErrorReport('Error A', 'Context A');
      sentryErrorReport('Error B', 'Context B');

      const call1 = mockCaptureException.mock.calls[0]?.[0] as Error;
      const call2 = mockCaptureException.mock.calls[1]?.[0] as Error;

      expect(call1.message).toBe('[Context A] Error A');
      expect(call2.message).toBe('[Context B] Error B');
      expect(call1).not.toBe(call2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular reference in object', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;

      expect(() => {
        sentryErrorReport(circular, 'Circular context');
      }).toThrow(TypeError);
    });

    it('should handle nested objects', () => {
      const nested = {
        outer: {
          inner: { deep: 'value' },
        },
      };

      sentryErrorReport(nested, 'Nested context');

      const capturedError = mockCaptureException.mock.calls[0]?.[0];
      expect((capturedError as Error).message).toContain('outer');
      expect((capturedError as Error).message).toContain('inner');
    });

    it('should handle object with undefined properties', () => {
      const obj = { defined: 'value', undefined: undefined };

      sentryErrorReport(obj, 'Undefined props context');

      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });
  });

  describe('Return Value', () => {
    it('should not return any value', () => {
      const result = sentryErrorReport(new Error('Test'), 'Context');

      expect(result).toBeUndefined();
    });
  });
});
