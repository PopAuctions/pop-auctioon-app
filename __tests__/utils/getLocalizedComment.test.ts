import { SUPPORTED_LANGUAGES } from '@/i18n/locales';
import type { Comment } from '@/types/types';
import { getLocalizedComment } from '@/utils/getLocalizedComment';

describe('getLocalizedComment', () => {
  it.each(SUPPORTED_LANGUAGES)(
    'uses %s when present and otherwise falls back to English',
    (lang) => {
      const comment: Comment = {
        es: 'es-comment',
        en: 'en-comment',
      };

      expect(getLocalizedComment(comment, lang)).toBe(
        comment[lang] ?? comment.en
      );
    }
  );
});
