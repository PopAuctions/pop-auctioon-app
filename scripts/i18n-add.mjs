import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const localeConfigPath = resolve(repositoryRoot, 'src/i18n/locales.ts');
const dictionariesDirectory = resolve(repositoryRoot, 'src/i18n/locales');
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`i18n:add: ${message}`);
  process.exit(1);
}

function parseArguments(argumentsList) {
  let locale;
  let dryRun = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === '--') {
      continue;
    }

    if (argument === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (argument.startsWith('--locale=')) {
      locale = argument.slice('--locale='.length);
      continue;
    }

    if (argument === '--locale') {
      locale = argumentsList[index + 1];
      index += 1;
      continue;
    }

    fail(`unknown argument ${argument}. Use --locale=<code> [--dry-run].`);
  }

  if (!locale) {
    fail('a locale is required. Use --locale=<code>.');
  }

  if (!LOCALE_PATTERN.test(locale)) {
    fail(`"${locale}" is not a supported locale code format.`);
  }

  return { locale, dryRun };
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

  return { locales, defaultLocale: defaultMatch[1] };
}

function createTranslationTemplate(value, locale) {
  if (typeof value === 'string') {
    return `TODO_TRANSLATE[${locale}]: ${value}`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => createTranslationTemplate(item, locale));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        createTranslationTemplate(item, locale),
      ])
    );
  }

  return value;
}

function readDictionary(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read dictionary ${path}: ${error.message}`);
  }
}

const { locale, dryRun } = parseArguments(process.argv.slice(2));
const { locales, defaultLocale } = readLocaleRegistry();

if (!locales.has(locale)) {
  fail(
    `"${locale}" is not registered in src/i18n/locales.ts. Add its complete locale configuration before scaffolding dictionaries.`
  );
}

if (!locales.has(defaultLocale)) {
  fail(`DEFAULT_LANG "${defaultLocale}" is not registered in LOCALE_CONFIG.`);
}

const source = resolve(dictionariesDirectory, `${defaultLocale}.json`);
const target = resolve(dictionariesDirectory, `${locale}.json`);

if (!dryRun && existsSync(target)) {
  fail(`refusing to overwrite existing dictionary ${target}.`);
}

const template = createTranslationTemplate(readDictionary(source), locale);

if (!dryRun) {
  writeFileSync(target, `${JSON.stringify(template, null, 2)}\n`);
}

console.log(`${dryRun ? 'Would create' : 'Created'} ${target}`);
console.log(
  `Next: replace every TODO_TRANSLATE[${locale}] value, add ${locale} to the explicit translation imports and map, then run pnpm i18n:check.`
);
