import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(repositoryRoot, 'src');
const sourceExtensions = new Set(['.ts', '.tsx']);
const serializedBilingualMessage =
  /JSON\.stringify\s*\(\s*\{(?=[\s\S]{0,800}?["']?en["']?\s*:)(?=[\s\S]{0,800}?["']?es["']?\s*:)[\s\S]{0,800}?\}\s*\)/;
const localizedParsedError =
  /JSON\.parse\s*\(\s*[^)]*(?:error|message)[^)]*\)\s*\[\s*(?:lang|locale)\s*\]/i;

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) return sourceFiles(absolutePath);
    return sourceExtensions.has(extname(entry.name)) ? [absolutePath] : [];
  });
}

const errors = [];

for (const file of sourceFiles(sourceRoot)) {
  const contents = readFileSync(file, 'utf8');
  const projectPath = relative(repositoryRoot, file);

  if (
    projectPath.includes('/schemas/') &&
    serializedBilingualMessage.test(contents)
  ) {
    errors.push(
      `${projectPath}: serialize a typed validation key instead of an { en, es } message`
    );
  }

  if (localizedParsedError.test(contents)) {
    errors.push(
      `${projectPath}: render validation errors through the typed validation-message helper`
    );
  }
}

if (errors.length) {
  console.error('\nFound legacy bilingual validation-message code:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('✓ no serialized bilingual validation messages');
}
