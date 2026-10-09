import { getApiMessageMetadata, resolveApiMessage } from '@/i18n/api-message';

describe('API message compatibility', () => {
  it('accepts known codes and defaults missing parameters to an empty object', () => {
    expect(
      getApiMessageMetadata({
        messageCode: 'common.toast.success',
      })
    ).toEqual({
      messageCode: 'common.toast.success',
      messageParams: {},
    });
  });

  it('uses the legacy map when the message code is unknown', () => {
    const legacy = { en: 'legacy-en', es: 'legacy-es' };

    expect(
      resolveApiMessage(
        {
          error: legacy,
          messageCode: 'unknown.message.code',
          messageParams: {},
        },
        'error'
      )
    ).toEqual(legacy);
  });

  it('uses the legacy map when message parameters are malformed', () => {
    const legacy = { en: 'legacy-en', es: 'legacy-es' };

    expect(
      resolveApiMessage(
        {
          error: legacy,
          messageCode: 'validation.usernameMinLength',
          messageParams: { min: null },
        },
        'error'
      )
    ).toEqual(legacy);
  });

  it('keeps legacy string errors compatible with every supported locale', () => {
    const resolved = resolveApiMessage({ error: 'legacy' }, 'error');

    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
    expect(new Set(Object.values(resolved ?? {}))).toEqual(new Set(['legacy']));
  });

  it('preserves a null message field instead of manufacturing a message', () => {
    expect(
      resolveApiMessage(
        {
          success: null,
          messageCode: 'common.toast.success',
          messageParams: {},
        },
        'success'
      )
    ).toBeUndefined();
  });
});
