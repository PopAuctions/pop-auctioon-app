// AsyncStorage key for user's language preference
export const LANGUAGE_STORAGE_KEY = '@app_language';

/**
 * Flag indicating that the local language preference should take precedence
 * over the value stored in the DB on the next login. This may be set when the
 * app persists the device locale on first launch, when the user explicitly
 * changes language (e.g. via `changeLanguage`), or when they do so while
 * unauthenticated. On login, if this flag is set the local value is pushed to
 * the DB instead of being overwritten by the DB value.
 */
export const LANGUAGE_MANUALLY_SET_KEY = '@app_language_manually_set';
