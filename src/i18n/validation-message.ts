import defaultDictionary from '@/i18n/locales/es.json';
import type { Lang } from '@/i18n/locales';

export type ValidationMessageParam = string | number | boolean;
export type ValidationMessageParams = Readonly<
  Record<string, ValidationMessageParam>
>;

type ValidationMessageName = keyof typeof defaultDictionary.validation;

export type ValidationMessageKey = `validation.${ValidationMessageName}`;

export type ValidationMessage = {
  key: ValidationMessageKey;
  params?: ValidationMessageParams;
};

export type ValidationMessageTranslator = (
  key: ValidationMessageKey,
  params?: ValidationMessageParams
) => string;

const VALIDATION_MESSAGE_PREFIX = '__validation_message__:';
const validationMessageKeys = new Set<string>(
  Object.keys(defaultDictionary.validation).map((key) => `validation.${key}`)
);

function isValidationMessageKey(value: unknown): value is ValidationMessageKey {
  return typeof value === 'string' && validationMessageKeys.has(value);
}

function isValidationMessageParams(
  value: unknown
): value is ValidationMessageParams {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (param) =>
        typeof param === 'string' ||
        typeof param === 'number' ||
        typeof param === 'boolean'
    )
  );
}

export function createValidationMessage(
  key: ValidationMessageKey,
  params?: ValidationMessageParams
): string {
  const message: ValidationMessage = params ? { key, params } : { key };

  return `${VALIDATION_MESSAGE_PREFIX}${JSON.stringify(message)}`;
}

export function parseValidationMessage(
  message: string
): ValidationMessage | undefined {
  if (!message.startsWith(VALIDATION_MESSAGE_PREFIX)) return undefined;

  try {
    const parsed: unknown = JSON.parse(
      message.slice(VALIDATION_MESSAGE_PREFIX.length)
    );

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return undefined;
    }

    const candidate = parsed as Record<string, unknown>;
    if (!isValidationMessageKey(candidate.key)) return undefined;
    if (
      candidate.params !== undefined &&
      !isValidationMessageParams(candidate.params)
    ) {
      return undefined;
    }

    return candidate.params === undefined
      ? { key: candidate.key }
      : { key: candidate.key, params: candidate.params };
  } catch {
    return undefined;
  }
}

function renderLegacyValidationMessage(message: string, locale: Lang): string {
  try {
    const parsed: unknown = JSON.parse(message);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      const localizedMessage = (parsed as Record<string, unknown>)[locale];
      if (typeof localizedMessage === 'string' && localizedMessage) {
        return localizedMessage;
      }
    }
  } catch {
    // Plain strings remain valid while existing schemas are migrated.
  }

  return message;
}

export function renderValidationMessage(
  message: string | undefined,
  locale: Lang,
  translate: ValidationMessageTranslator
): string {
  if (!message) return '';

  const validationMessage = parseValidationMessage(message);
  if (validationMessage) {
    return translate(validationMessage.key, validationMessage.params);
  }

  return renderLegacyValidationMessage(message, locale);
}
