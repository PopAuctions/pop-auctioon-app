import { getErrorMessage } from '@/utils/form-errors';
import { createValidationMessage } from '@/i18n/validation-message';

describe('getErrorMessage', () => {
  describe('with typed validation messages', () => {
    it('renders dictionary keys and parameters in the requested locale', () => {
      const message = createValidationMessage('validation.usernameMinLength', {
        min: 3,
      });

      expect(getErrorMessage(message, 'en')).toContain('3');
      expect(getErrorMessage(message, 'es')).toContain('3');
      expect(getErrorMessage(message, 'en')).not.toBe(
        getErrorMessage(message, 'es')
      );
    });
  });

  describe('with plain text messages', () => {
    it('should return plain text message as-is', () => {
      const message = 'Invalid email';

      expect(getErrorMessage(message, 'es')).toBe('Invalid email');
      expect(getErrorMessage(message, 'en')).toBe('Invalid email');
    });

    it('should handle messages with special characters', () => {
      const message = "Passwords don't match";

      expect(getErrorMessage(message, 'es')).toBe("Passwords don't match");
    });
  });

  describe('edge cases', () => {
    it('should return empty string for undefined message', () => {
      expect(getErrorMessage(undefined, 'es')).toBe('');
      expect(getErrorMessage(undefined, 'en')).toBe('');
    });

    it('should handle empty string message', () => {
      expect(getErrorMessage('', 'es')).toBe('');
    });
  });
});
