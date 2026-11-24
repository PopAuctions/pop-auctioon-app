import { getVersionUpdateType } from '@/utils/appVersion';

describe('getVersionUpdateType', () => {
  it.each([
    ['1.4.0', '1.4.0', 'none'],
    ['1.4.0', '1.4.1', 'soft'],
    ['1.4.0', '1.5.0', 'soft'],
    ['1.4.9', '1.5.0', 'soft'],
    ['1.4.0', '2.0.0', 'force'],
    ['1.5.0', '1.4.0', 'none'],
    ['1.4.1', '1.4.0', 'none'],
    ['1.5.0', '1.4.9', 'none'],
    ['2.0.0', '1.9.9', 'none'],
    ['1.9.0', '1.10.0', 'soft'],
  ] as const)(
    'compares installed %s with server %s',
    (local, server, expected) => {
      expect(getVersionUpdateType(local, server)).toBe(expected);
    }
  );

  it.each([
    [null, '1.5.0'],
    ['1.4.0', null],
    ['1.4', '1.5.0'],
    ['1.4.0', 'invalid'],
    ['1.4.0', '1.5.0-beta'],
  ])(
    'does not show an alert for invalid or missing versions',
    (local, server) => {
      expect(getVersionUpdateType(local, server)).toBe('none');
    }
  );
});
