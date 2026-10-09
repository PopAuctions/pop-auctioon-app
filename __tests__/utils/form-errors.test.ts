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

  describe('with JSON messages', () => {
    it('should return message in specified locale (Spanish)', () => {
      const message = JSON.stringify({
        en: 'message-en',
        es: 'message-es',
      });

      expect(getErrorMessage(message, 'es')).toBe('message-es');
    });

    it('should return message in specified locale (English)', () => {
      const message = JSON.stringify({
        en: 'message-en',
        es: 'message-es',
      });

      expect(getErrorMessage(message, 'en')).toBe('message-en');
    });

    it('should return original message if locale not found', () => {
      const message = JSON.stringify({
        en: 'message-en',
        es: 'message-es',
      });

      expect(getErrorMessage(message, 'fr')).toBe(message);
    });

    it('should handle complex error messages', () => {
      const message = JSON.stringify({
        en: 'complex-en',
        es: 'complex-es',
      });

      expect(getErrorMessage(message, 'es')).toBe('complex-es');
      expect(getErrorMessage(message, 'en')).toBe('complex-en');
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

    it('should handle malformed JSON gracefully', () => {
      const message = '{invalid json}';

      expect(getErrorMessage(message, 'es')).toBe(message);
    });

    it('should handle partial JSON objects', () => {
      const message = JSON.stringify({
        en: 'Required',
      });

      expect(getErrorMessage(message, 'es')).toBe(message);
    });
  });

  describe('real-world scenarios', () => {
    it('should work with Zod validation messages', () => {
      const zodMessage = JSON.stringify({
        en: 'validation-en',
        es: 'validation-es',
      });

      expect(getErrorMessage(zodMessage, 'es')).toBe('validation-es');
    });

    it('should work with URL validation messages', () => {
      const urlMessage = JSON.stringify({
        en: 'url-en',
        es: 'url-es',
      });

      expect(getErrorMessage(urlMessage, 'es')).toBe('url-es');
      expect(getErrorMessage(urlMessage, 'en')).toBe('url-en');
    });

    it('should handle fallback for missing translations', () => {
      const message = JSON.stringify({
        en: 'only-en',
      });

      // Should return original message when es translation is missing
      expect(getErrorMessage(message, 'es')).toBe(message);
      // Should return en translation when it exists
      expect(getErrorMessage(message, 'en')).toBe('only-en');
    });
  });
});
