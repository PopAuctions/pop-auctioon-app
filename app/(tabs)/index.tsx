import { Redirect } from 'expo-router';

/**
 * Index route that redirects to the home tab
 * This ensures that when the app reloads or starts, it goes to home by default
 */
export default function TabsIndex() {
  return <Redirect href='/(tabs)/home' />;
}
