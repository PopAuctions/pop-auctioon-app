export type VersionUpdateType = 'none' | 'soft' | 'force';

export function getVersionUpdateType(
  localVersion?: string | null,
  serverVersion?: string | null
): VersionUpdateType {
  if (!localVersion || !serverVersion) return 'none';

  const versionPattern = /^\d+\.\d+\.\d+$/;
  if (
    !versionPattern.test(localVersion) ||
    !versionPattern.test(serverVersion)
  ) {
    return 'none';
  }

  const [localMajor, localMinor, localPatch] = localVersion
    .split('.')
    .map(Number);
  const [serverMajor, serverMinor, serverPatch] = serverVersion
    .split('.')
    .map(Number);

  if (serverMajor !== localMajor) {
    return serverMajor > localMajor ? 'force' : 'none';
  }

  if (serverMinor !== localMinor) {
    return serverMinor > localMinor ? 'soft' : 'none';
  }

  return serverPatch > localPatch ? 'soft' : 'none';
}
