import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localeConfigPath = resolve(repositoryRoot, 'src/i18n/locales.ts');

function fail(message) {
  console.error(`i18n:check: ${message}`);
  process.exit(1);
}

function readLocaleRegistry() {
  const source = readFileSync(localeConfigPath, 'utf8');
  const configMatch = source.match(
    /export const LOCALE_CONFIG\s*=\s*\{([\s\S]*?)\n\} as const;/
  );
  const defaultMatch = source.match(
    /export const DEFAULT_LANG\s*:\s*Lang\s*=\s*['"]([^'"]+)['"]/
  );

  if (!configMatch || !defaultMatch) {
    fail(
      'could not read LOCALE_CONFIG and DEFAULT_LANG from src/i18n/locales.ts.'
    );
  }

  const locales = new Set();
  const entryPattern = /^ {2}(?:'([^']+)'|"([^"]+)"|([A-Za-z][\w-]*))\s*:/gm;

  for (const match of configMatch[1].matchAll(entryPattern)) {
    locales.add(match[1] ?? match[2] ?? match[3]);
  }

  const defaultLocale = defaultMatch[1];

  if (!locales.has(defaultLocale)) {
    fail(`DEFAULT_LANG "${defaultLocale}" is not registered in LOCALE_CONFIG.`);
  }

  return { locales: [...locales].sort(), defaultLocale };
}

function readDictionary(relativePath) {
  const absolutePath = resolve(repositoryRoot, relativePath);
  return JSON.parse(readFileSync(absolutePath, 'utf8'));
}

function valueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function flattenLeaves(value, path = '', leaves = new Map()) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenLeaves(child, path ? `${path}.${key}` : key, leaves);
    }
    return leaves;
  }

  leaves.set(path, value);
  return leaves;
}

function collectPlaceholders(value) {
  const placeholders = new Set();
  const strings = Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [value];

  for (const text of strings) {
    if (typeof text !== 'string') continue;

    // Supports i18n-js (%{name}), simple ({name}), Mustache ({{name}}), and ICU ({count, plural, ...}).
    for (const match of text.matchAll(
      /\{\{?\s*([A-Za-z_][\w.-]*)\s*(?=[,}])/g
    )) {
      placeholders.add(match[1]);
    }
  }

  return [...placeholders].sort();
}

function isEmptyTranslation(value) {
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) {
    return value.some(
      (item) => typeof item === 'string' && item.trim().length === 0
    );
  }
  return false;
}

function isUntranslatedTemplate(value) {
  if (typeof value === 'string') return value.includes('TODO_TRANSLATE[');
  if (Array.isArray(value)) {
    return value.some(
      (item) => typeof item === 'string' && item.includes('TODO_TRANSLATE[')
    );
  }
  return false;
}

function comparePair({ reference, translation, referenceLocale, locale }) {
  const referenceLeaves = flattenLeaves(readDictionary(reference));
  const translationLeaves = flattenLeaves(readDictionary(translation));
  const errors = [];

  for (const key of referenceLeaves.keys()) {
    if (!translationLeaves.has(key)) {
      errors.push(`app dictionaries: missing ${locale} key "${key}"`);
    }
  }

  for (const key of translationLeaves.keys()) {
    if (!referenceLeaves.has(key)) {
      errors.push(`app dictionaries: unexpected ${locale} key "${key}"`);
    }
  }

  for (const [key, referenceValue] of referenceLeaves) {
    if (!translationLeaves.has(key)) continue;

    const translationValue = translationLeaves.get(key);

    if (isEmptyTranslation(referenceValue)) {
      errors.push(
        `app dictionaries: empty ${referenceLocale} translation at "${key}"`
      );
    }
    if (isEmptyTranslation(translationValue)) {
      errors.push(`app dictionaries: empty ${locale} translation at "${key}"`);
    }
    if (isUntranslatedTemplate(referenceValue)) {
      errors.push(
        `app dictionaries: unfinished ${referenceLocale} template at "${key}"`
      );
    }
    if (isUntranslatedTemplate(translationValue)) {
      errors.push(
        `app dictionaries: unfinished ${locale} template at "${key}"`
      );
    }

    const referenceType = valueType(referenceValue);
    const translationType = valueType(translationValue);

    if (referenceType !== translationType) {
      errors.push(
        `app dictionaries: type mismatch at "${key}" (${referenceLocale}: ${referenceType}, ${locale}: ${translationType})`
      );
      continue;
    }

    const referencePlaceholders = collectPlaceholders(referenceValue);
    const translationPlaceholders = collectPlaceholders(translationValue);

    if (referencePlaceholders.join('|') !== translationPlaceholders.join('|')) {
      errors.push(
        `app dictionaries: placeholder mismatch at "${key}" (${referenceLocale}: [${referencePlaceholders.join(', ')}], ${locale}: [${translationPlaceholders.join(', ')}])`
      );
    }
  }

  return {
    errors,
    summary: `app dictionaries (${referenceLocale} → ${locale}): ${referenceLeaves.size} ${referenceLocale} keys, ${translationLeaves.size} ${locale} keys`,
  };
}

const { locales, defaultLocale } = readLocaleRegistry();
const results = locales
  .filter((locale) => locale !== defaultLocale)
  .map((locale) =>
    comparePair({
      reference: `src/i18n/locales/${defaultLocale}.json`,
      translation: `src/i18n/locales/${locale}.json`,
      referenceLocale: defaultLocale,
      locale,
    })
  );
const errors = results.flatMap((result) => result.errors);

for (const result of results) {
  console.log(`✓ ${result.summary}`);
}

if (errors.length > 0) {
  console.error(
    `\nFound ${errors.length} i18n consistency error${errors.length === 1 ? '' : 's'}:`
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nAll registered dictionaries are consistent.');
}
