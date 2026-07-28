import type { DisplayedNotification } from '@/types/types';

export const normalizeNotificationsData = (
  data: unknown
): DisplayedNotification[] | null => {
  if (Array.isArray(data)) {
    return data as DisplayedNotification[];
  }

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray(data.data)
  ) {
    return data.data as DisplayedNotification[];
  }

  return null;
};
