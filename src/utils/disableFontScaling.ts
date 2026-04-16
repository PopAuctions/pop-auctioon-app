/**
 * Disable Font Scaling Globally
 *
 * This module disables the font scaling feature that allows users to
 * increase font size through system settings. This prevents layout issues
 * and maintains consistent design across all devices.
 *
 * Apply this early in the app lifecycle (e.g., in app/_layout.tsx)
 */

import { Text, TextInput } from 'react-native';

/**
 * Disables font scaling for all Text and TextInput components globally
 *
 * This function overrides the default render behavior of Text and TextInput
 * to always set allowFontScaling to false, preventing the system font size
 * settings from affecting the app's layout.
 *
 * Call this once at app initialization.
 */
export function disableFontScaling() {
  // Disable font scaling for Text components
  // @ts-expect-error - defaultProps is not officially typed but exists at runtime
  if (Text.defaultProps == null) {
    // @ts-expect-error - defaultProps is not officially typed but exists at runtime
    Text.defaultProps = {};
  }
  // @ts-expect-error - defaultProps is not officially typed but exists at runtime
  Text.defaultProps.allowFontScaling = false;

  // Disable font scaling for TextInput components
  // @ts-expect-error - defaultProps is not officially typed but exists at runtime
  if (TextInput.defaultProps == null) {
    // @ts-expect-error - defaultProps is not officially typed but exists at runtime
    TextInput.defaultProps = {};
  }
  // @ts-expect-error - defaultProps is not officially typed but exists at runtime
  TextInput.defaultProps.allowFontScaling = false;
}
