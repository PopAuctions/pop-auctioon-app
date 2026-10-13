import { execFileSync } from 'node:child_process';

const baseRef = process.env.I18N_BASE_REF ?? 'develop';

function runGit(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

function getBaseRef() {
  try {
    return runGit(['merge-base', baseRef, 'HEAD']).trim();
  } catch {
    console.error(
      `i18n:check: could not resolve base ref "${baseRef}" for boundary checks.`
    );
    process.exit(1);
  }
}

function collectAddedLines(diff) {
  const files = new Map();
  let path = null;

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      path = line.slice('+++ b/'.length);
      files.set(path, files.get(path) ?? []);
      continue;
    }

    if (path && line.startsWith('+') && !line.startsWith('+++')) {
      files.get(path).push(line.slice(1));
    }
  }

  return files;
}

function isPresentationSource(path) {
  return (
    /\.(?:ts|tsx)$/.test(path) &&
    (path.startsWith('app/') ||
      path.startsWith('src/components/') ||
      path.startsWith('src/hooks/'))
  );
}

function isCompatibilityBoundary(path) {
  return (
    path === 'src/hooks/api/useSecureApi.ts' ||
    path === 'src/i18n/api-message.ts' ||
    path === 'src/types/types.ts'
  );
}

const LEGACY_HOOK_COMPATIBILITY_PATHS = new Set([
  // These hooks only adapt released API/Toast compatibility payloads. They must
  // not be used as examples for new hook contracts.
  'src/hooks/useToast.tsx',
  'src/hooks/pages/payment/useGetDiscountCode.ts',
  'src/hooks/pages/user/useGetCurrentUser.ts',
]);

const base = getBaseRef();
const diffs = [
  runGit(['diff', '--unified=0', '--no-ext-diff', `${base}...HEAD`]),
  runGit(['diff', '--unified=0', '--no-ext-diff', '--cached']),
  runGit(['diff', '--unified=0', '--no-ext-diff']),
];
const addedLinesByFile = new Map();

for (const diff of diffs) {
  for (const [path, lines] of collectAddedLines(diff)) {
    addedLinesByFile.set(path, [
      ...(addedLinesByFile.get(path) ?? []),
      ...lines,
    ]);
  }
}

const errors = [];
const inlineLangProperty = /\b(?:en|es)\s*:\s*['"`]/;
const binaryLocaleBranch =
  /\b(?:lang|locale)\s*(?:===|!==|==|!=)\s*['"](?:en|es)['"]/;

for (const [path, lines] of addedLinesByFile) {
  if (!isPresentationSource(path) || isCompatibilityBoundary(path)) continue;

  const addedSource = lines.join('\n');
  const lineNumbers = lines.map((line, index) => `${index + 1}: ${line}`);

  if (lines.some((line) => inlineLangProperty.test(line))) {
    errors.push(
      `${path}: new inline en/es map detected; use a dictionary key, MessageKey, or approved compatibility adapter.\n  ${lineNumbers.find((line) => inlineLangProperty.test(line))}`
    );
  }

  if (binaryLocaleBranch.test(addedSource)) {
    errors.push(
      `${path}: new binary locale presentation branch detected; use the locale registry or dictionary lookup instead.`
    );
  }

  if (/JSON\.stringify\(\s*\{[\s\S]{0,240}\b(?:en|es)\s*:/.test(addedSource)) {
    errors.push(
      `${path}: new serialized bilingual validation message detected; use validation message keys instead.`
    );
  }

  if (
    (path.startsWith('src/components/') || path.startsWith('src/hooks/')) &&
    lines.some((line) => /\bLangMap\b/.test(line)) &&
    !LEGACY_HOOK_COMPATIBILITY_PATHS.has(path)
  ) {
    errors.push(
      `${path}: new LangMap usage in a reusable component or hook detected; expose a MessageKey, AppError, or current-locale string instead.`
    );
  }
}

if (errors.length > 0) {
  console.error(`\ni18n boundary check found ${errors.length} violation(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('✓ i18n boundary checks passed.');
}
