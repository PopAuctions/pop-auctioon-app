import { normalizeNotificationsData } from '@/utils/notifications/normalize-notifications-data';

const notification = {
  id: 'notification-1',
  read: false,
};

describe('normalizeNotificationsData', () => {
  it('returns an array response unchanged', () => {
    expect(normalizeNotificationsData([notification])).toEqual([notification]);
  });

  it('unwraps a legacy nested data response', () => {
    expect(normalizeNotificationsData({ data: [notification] })).toEqual([
      notification,
    ]);
  });

  it('rejects a non-array response', () => {
    expect(normalizeNotificationsData({ message: 'Unexpected response' })).toBe(
      null
    );
  });
});
