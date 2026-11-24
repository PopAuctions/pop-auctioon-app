import type { ConfigContext, ExpoConfig } from 'expo/config';

function requireConfigValue(value: string | undefined, name: string): string {
  if (value) return value;

  throw new Error(`Missing required Expo config value: ${name}`);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: requireConfigValue(config.name, 'name'),
  slug: requireConfigValue(config.slug, 'slug'),
  version: requireConfigValue(config.version, 'version'),
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
