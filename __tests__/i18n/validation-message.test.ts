import {
  createValidationMessage,
  parseValidationMessage,
  renderValidationMessage,
  type ValidationMessageTranslator,
} from '@/i18n/validation-message';

describe('validation messages', () => {
  const translate: ValidationMessageTranslator = (key, params) =>
    `${key}:${String(params?.min ?? '')}`;

  it('round-trips a typed key and parameters', () => {
    const encoded = createValidationMessage('validation.minLength', { min: 3 });

    expect(parseValidationMessage(encoded)).toEqual({
      key: 'validation.minLength',
      params: { min: 3 },
    });
    expect(renderValidationMessage(encoded, translate)).toBe(
      'validation.minLength:3'
    );
  });

  it('supports messages without parameters', () => {
    const encoded = createValidationMessage('validation.required');

    expect(parseValidationMessage(encoded)).toEqual({
      key: 'validation.required',
    });
  });

  it('preserves plain messages and handles missing messages', () => {
    expect(renderValidationMessage('plain-message', translate)).toBe(
      'plain-message'
    );
    expect(renderValidationMessage(undefined, translate)).toBe('');
  });

  it('does not treat malformed or unknown payloads as typed messages', () => {
    expect(
      parseValidationMessage(
        '__validation_message__:{"key":"validation.unknown"}'
      )
    ).toBeUndefined();
    expect(
      parseValidationMessage(
        '__validation_message__:{"key":"validation.required","params":{"min":null}}'
      )
    ).toBeUndefined();
  });
});
