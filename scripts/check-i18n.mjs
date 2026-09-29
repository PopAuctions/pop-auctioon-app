import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const dictionaryPair = {
  name: 'app dictionaries',
  english: 'src/i18n/locales/en.json',
  spanish: 'src/i18n/locales/es.json',
};

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

function comparePair({ name, english, spanish }) {
  const englishLeaves = flattenLeaves(readDictionary(english));
  const spanishLeaves = flattenLeaves(readDictionary(spanish));
  const errors = [];

  for (const key of englishLeaves.keys()) {
    if (!spanishLeaves.has(key)) {
      errors.push(`${name}: missing Spanish key "${key}"`);
    }
  }

  for (const key of spanishLeaves.keys()) {
    if (!englishLeaves.has(key)) {
      errors.push(`${name}: missing English key "${key}"`);
    }
  }

  for (const [key, englishValue] of englishLeaves) {
    if (!spanishLeaves.has(key)) continue;

    const spanishValue = spanishLeaves.get(key);

    if (isEmptyTranslation(englishValue)) {
      errors.push(`${name}: empty English translation at "${key}"`);
    }
    if (isEmptyTranslation(spanishValue)) {
      errors.push(`${name}: empty Spanish translation at "${key}"`);
    }

    const englishType = valueType(englishValue);
    const spanishType = valueType(spanishValue);

    if (englishType !== spanishType) {
      errors.push(
        `${name}: type mismatch at "${key}" (English: ${englishType}, Spanish: ${spanishType})`
      );
      continue;
    }

    const englishPlaceholders = collectPlaceholders(englishValue);
    const spanishPlaceholders = collectPlaceholders(spanishValue);

    if (englishPlaceholders.join('|') !== spanishPlaceholders.join('|')) {
      errors.push(
        `${name}: placeholder mismatch at "${key}" (English: [${englishPlaceholders.join(', ')}], Spanish: [${spanishPlaceholders.join(', ')}])`
      );
    }
  }

  return {
    errors,
    summary: `${name}: ${englishLeaves.size} English keys, ${spanishLeaves.size} Spanish keys`,
  };
}

const result = comparePair(dictionaryPair);

console.log(`✓ ${result.summary}`);

if (result.errors.length > 0) {
  console.error(
    `\nFound ${result.errors.length} i18n consistency error${result.errors.length === 1 ? '' : 's'}:`
  );
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nThe English and Spanish dictionaries are consistent.');
}
