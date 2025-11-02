/**
 * Parsea mensajes de error de formularios que pueden estar en formato JSON con traducciones
 * o como strings simples.
 *
 * @param message - Mensaje de error que puede ser un JSON stringificado con traducciones o un string simple
 * @param locale - Código de idioma actual (ej: 'es', 'en')
 * @returns El mensaje de error en el idioma especificado o el mensaje original
 *
 * @example
 * // Con mensaje JSON
 * const msg = '{"en":"Required","es":"Requerido"}';
 * getErrorMessage(msg, 'es'); // "Requerido"
 *
 * @example
 * // Con mensaje simple
 * const msg = 'Invalid email';
 * getErrorMessage(msg, 'es'); // "Invalid email"
 */
export const getErrorMessage = (
  message: string | undefined,
  locale: string
): string => {
  if (!message) return '';

  try {
    const parsed = JSON.parse(message);
    return parsed[locale] || message;
  } catch {
    // Si no es JSON válido, devolver el mensaje tal cual
    return message;
  }
};
