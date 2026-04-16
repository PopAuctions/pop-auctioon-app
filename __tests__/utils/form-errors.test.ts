import { getErrorMessage } from '@/utils/form-errors';

describe('getErrorMessage', () => {
  describe('with JSON messages', () => {
    it('should return message in specified locale (Spanish)', () => {
      const message = JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      });

      expect(getErrorMessage(message, 'es')).toBe('Requerido');
    });

    it('should return message in specified locale (English)', () => {
      const message = JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      });

      expect(getErrorMessage(message, 'en')).toBe('Required');
    });

    it('should return original message if locale not found', () => {
      const message = JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      });

      expect(getErrorMessage(message, 'fr')).toBe(message);
    });

    it('should handle complex error messages', () => {
      const message = JSON.stringify({
        en: 'Min. 5 characters',
        es: 'Mín. 5 caracteres',
      });

      expect(getErrorMessage(message, 'es')).toBe('Mín. 5 caracteres');
      expect(getErrorMessage(message, 'en')).toBe('Min. 5 characters');
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
        en: 'Required (Min. 5 characters)',
        es: 'Requerido (Mín. 5 caracteres)',
      });

      expect(getErrorMessage(zodMessage, 'es')).toBe(
        'Requerido (Mín. 5 caracteres)'
      );
    });

    it('should work with URL validation messages', () => {
      const urlMessage = JSON.stringify({
        en: 'Invalid URL',
        es: 'URL inválida',
      });

      expect(getErrorMessage(urlMessage, 'es')).toBe('URL inválida');
      expect(getErrorMessage(urlMessage, 'en')).toBe('Invalid URL');
    });

    it('should handle fallback for missing translations', () => {
      const message = JSON.stringify({
        en: 'No spaces allowed.',
      });

      // Should return original message when es translation is missing
      expect(getErrorMessage(message, 'es')).toBe(message);
      // Should return en translation when it exists
      expect(getErrorMessage(message, 'en')).toBe('No spaces allowed.');
    });
  });
});
