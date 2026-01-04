import * as Notifications from 'expo-notifications';
import { getNotificationRoute } from '@/utils/notifications/getNotificationRoute';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock dependencies
jest.mock('@/lib/error/sentry-error-report');

describe('getNotificationRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Null/Invalid Input Handling', () => {
    it('should return null for null notification', () => {
      const result = getNotificationRoute(null);
      expect(result).toBeNull();
    });

    it('should return null when notification data is missing', () => {
      const notification = {
        request: {
          content: {
            data: null,
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });

    it('should return null when notification data is not an object', () => {
      const notification = {
        request: {
          content: {
            data: 'not-an-object',
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });
  });

  describe('Route Extraction', () => {
    it('should extract route from data.route field', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/auctions/32',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions/32');
    });

    it('should extract route from data.path field as fallback', () => {
      const notification = {
        request: {
          content: {
            data: {
              path: '/(tabs)/home',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/home');
    });

    it('should prefer data.route over data.path when both exist', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/auctions/32',
              path: '/(tabs)/home',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions/32');
    });

    it('should return null when route is not a string', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: 12345,
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });

    it('should return null when route is an empty string', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });
  });

  describe('Route Format Validation', () => {
    it('should accept absolute routes with parentheses', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/auctions',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions');
    });

    it('should accept routes with dynamic segments', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/auctions/[id]',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions/[id]');
    });

    it('should accept nested routes', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/account/settings/notifications',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/account/settings/notifications');
    });

    it('should accept routes with query parameters', () => {
      const notification = {
        request: {
          content: {
            data: {
              route: '/(tabs)/auctions?filter=active&sort=date',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions?filter=active&sort=date');
    });
  });

  describe('Real-world Notification Scenarios', () => {
    it('should handle auction notification', () => {
      const notification = {
        request: {
          content: {
            title: 'Nueva subasta disponible',
            body: 'Artículo raro ahora disponible',
            data: {
              route: '/(tabs)/auctions/123',
              auctionId: 123,
              type: 'auction_started',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions/123');
    });

    it('should handle bid notification', () => {
      const notification = {
        request: {
          content: {
            title: 'Nueva oferta',
            body: 'Alguien ha superado tu oferta',
            data: {
              route: '/(tabs)/my-auctions/bids/456',
              articleId: 456,
              type: 'outbid',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/my-auctions/bids/456');
    });

    it('should handle win notification', () => {
      const notification = {
        request: {
          content: {
            title: '¡Has ganado!',
            body: 'Ganaste la subasta del artículo X',
            data: {
              route: '/(tabs)/account/purchase-history/789',
              orderId: 789,
              type: 'auction_won',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/account/purchase-history/789');
    });

    it('should handle notification with extra metadata', () => {
      const notification = {
        request: {
          content: {
            title: 'Recordatorio',
            body: 'La subasta termina en 10 minutos',
            data: {
              route: '/(tabs)/auctions/321',
              auctionId: 321,
              articleId: 654,
              type: 'auction_ending_soon',
              timestamp: '2026-01-04T12:00:00Z',
              priority: 'high',
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBe('/(tabs)/auctions/321');
    });
  });

  describe('Error Scenarios', () => {
    it('should return null when notification structure is malformed', () => {
      const notification = {
        request: {},
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });

    it('should return null when content is missing', () => {
      const notification = {
        request: {
          content: null,
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });

    it('should handle nested data structure gracefully', () => {
      const notification = {
        request: {
          content: {
            data: {
              nested: {
                route: '/(tabs)/auctions',
              },
            },
          },
        },
      } as any;

      const result = getNotificationRoute(notification);
      expect(result).toBeNull();
    });
  });
});
