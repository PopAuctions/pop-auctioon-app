import { isMessageKey, t, type MessageKey } from '@/i18n';
import { SUPPORTED_LANGUAGES } from '@/i18n/locales';
import type { LangMap } from '@/types/types';

export type ApiMessageParam = string | number | boolean;
export type ApiMessageParams = Readonly<Record<string, ApiMessageParam>>;
export type ApiMessageField = 'error' | 'success';

export type ApiMessageMetadata = {
  messageCode: MessageKey;
  messageParams: ApiMessageParams;
};

function isApiMessageParams(value: unknown): value is ApiMessageParams {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getApiMessageMetadata(
  payload: unknown
): ApiMessageMetadata | undefined {
  if (!isRecord(payload) || !isMessageKey(payload.messageCode)) {
    return undefined;
  }

  const params = payload.messageParams ?? {};
  if (!isApiMessageParams(params)) return undefined;

  return {
    messageCode: payload.messageCode,
    messageParams: params,
  };
}

export function createLocalizedMessage(
  messageCode: MessageKey,
  messageParams: ApiMessageParams = {}
): LangMap {
  return Object.fromEntries(
    SUPPORTED_LANGUAGES.map((locale) => [
      locale,
      String(t(messageCode, { ...messageParams, locale })),
    ])
  ) as LangMap;
}

function getLegacyMessage(
  payload: Record<string, unknown>,
  field: ApiMessageField
): LangMap | undefined {
  const legacyMessage = payload[field];

  if (isRecord(legacyMessage)) return legacyMessage as LangMap;

  if (typeof legacyMessage === 'string') {
    return Object.fromEntries(
      SUPPORTED_LANGUAGES.map((locale) => [locale, legacyMessage])
    ) as LangMap;
  }

  return undefined;
}

export function resolveApiMessage(
  payload: unknown,
  field: ApiMessageField
): LangMap | undefined {
  if (!isRecord(payload) || payload[field] == null) return undefined;

  const metadata = getApiMessageMetadata(payload);
  return metadata
    ? createLocalizedMessage(metadata.messageCode, metadata.messageParams)
    : getLegacyMessage(payload, field);
}
