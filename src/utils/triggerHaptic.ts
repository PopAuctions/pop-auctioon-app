import * as Haptics from 'expo-haptics';

type HapticType = 'impact' | 'success' | 'warning' | 'error' | 'selection';

interface Options {
  enabled?: boolean;
  throttleMs?: number; // prevent spam
}

const lastFire: Partial<Record<HapticType, number>> = {};

const canFire = (type: HapticType, throttleMs: number) => {
  const now = Date.now();
  const last = lastFire[type] ?? 0;
  if (now - last < throttleMs) return false;
  lastFire[type] = now;
  return true;
};

export const triggerHaptic = async (
  type: HapticType,
  options: Options = {}
) => {
  const { enabled = true, throttleMs = 0 } = options;

  if (!enabled) return;
  if (throttleMs > 0 && !canFire(type, throttleMs)) return;

  try {
    switch (type) {
      case 'impact':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case 'selection':
        await Haptics.selectionAsync();
        return;
      case 'success':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        return;
      case 'warning':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        return;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      default:
        return;
    }
  } catch (e) {
    // Some Android devices / simulators may not support it; fail silently.
    if (__DEV__) console.log('📳 [HAPTIC] failed', e);
  }
};

export const hapticImpact = (opts?: Options) => triggerHaptic('impact', opts);

export const hapticSelection = (opts?: Options) =>
  triggerHaptic('selection', opts);

export const hapticSuccess = (opts?: Options) => triggerHaptic('success', opts);

export const hapticError = (opts?: Options) => triggerHaptic('error', opts);
