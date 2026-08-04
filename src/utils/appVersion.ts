export type VersionUpdateType = 'none' | 'soft' | 'force';

export function getVersionUpdateType(
  localVersion?: string | null,
  serverVersion?: string | null
): VersionUpdateType {
  if (!localVersion || !serverVersion) return 'none';

  const [localMajor, localMinor, localPatch] = localVersion
    .split('.')
    .map(Number);
  const [serverMajor, serverMinor, serverPatch] = serverVersion
    .split('.')
    .map(Number);

  if (localMajor !== serverMajor) return 'force';

  if (localMinor !== serverMinor || localPatch !== serverPatch) {
    return 'soft';
  }

  return 'none';
}
