import type { Lang } from '@/i18n/locales';
import type { Comment } from '@/types/types';

export function getLocalizedComment(comment: Comment, lang: Lang): string {
  return comment[lang] ?? comment.en;
}
