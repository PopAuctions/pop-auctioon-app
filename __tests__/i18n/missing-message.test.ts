import * as Sentry from '@sentry/react-native';
import { changeLocale, t } from '@/i18n';

jest.mock('@sentry/react-native', () => ({ captureMessage: jest.fn() }));

describe('missing translation diagnostics', () => {
  beforeEach(() => {
    changeLocale('en');
  });

  it('does not report an existing translation', () => {
    expect(t('globals.back')).toBe('Back');
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('returns a safe localized fallback and reports only translation metadata', () => {
    expect(
      t('missing.message' as any, {
        privateValue: 'must-not-be-reported',
      })
    ).toBe('Something went wrong');

    expect(console.warn).toHaveBeenCalledWith(
      '[i18n] Missing message key "missing.message" for locale "en"; using generic-error fallback.'
    );
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Missing i18n message', {
      fingerprint: ['i18n-missing-message', 'en', 'missing.message'],
      level: 'warning',
      tags: {
        'i18n.fallback': 'generic-error',
        'i18n.key': 'missing.message',
        'i18n.locale': 'en',
      },
    });
    expect(
      JSON.stringify(jest.mocked(Sentry.captureMessage).mock.calls)
    ).not.toContain('must-not-be-reported');
  });
});
