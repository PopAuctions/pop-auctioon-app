/**
 * Test suite for useAuctionsCalendar hook
 * Tests basic functionality and error handling
 */
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuctionsCalendar } from '@/hooks/pages/calendar/useAuctionsCalendar';
import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

// Mock dependencies
jest.mock('@/utils/supabase/supabase-store', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

jest.mock('@/lib/error/sentry-error-report', () => ({
  sentryErrorReport: jest.fn(),
}));

const mockSupabase = supabase as any;
const mockSentryErrorReport = sentryErrorReport as jest.MockedFunction<
  typeof sentryErrorReport
>;

describe('useAuctionsCalendar', () => {
  const mockAuctionsData = {
    today: [
      {
        id: '1',
        title: 'Today Auction',
        startDate: new Date().toISOString(),
        image: 'https://example.com/image1.jpg',
      },
    ],
    this_month: [
      {
        id: '2',
        title: 'This Month Auction',
        startDate: new Date().toISOString(),
        image: 'https://example.com/image2.jpg',
      },
    ],
    next_month: [
      {
        id: '3',
        title: 'Next Month Auction',
        startDate: new Date(Date.now() + 86400000 * 35).toISOString(),
        image: 'https://example.com/image3.jpg',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial state and basic functionality', () => {
    it('should initialize with correct default state', () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      // Check initial state
      expect(result.current.status).toBe('loading');
      expect(result.current.auctions).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should provide refetch function', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Successful data fetching', () => {
    it('should successfully fetch and return auctions data', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(result.current.auctions).toEqual(mockAuctionsData);
      expect(result.current.status).toBe('loaded');
    });

    it('should call RPC with correct function name and parameters', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'filter_auctions_for_calendar',
        expect.objectContaining({
          today: expect.any(String),
          start_of_month: expect.any(String),
          end_of_month: expect.any(String),
          start_of_next_month: expect.any(String),
          end_of_next_month: expect.any(String),
          category_param: null,
        })
      );
    });
  });

  describe('Refetch functionality', () => {
    it('should handle refetch correctly', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      // Clear previous calls
      mockSupabase.rpc.mockClear();

      // Call refetch
      await result.current.refetch();

      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('loaded');
    });

    it('should handle refetch errors', async () => {
      // Initial successful load
      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      // Mock error for refetch
      mockSupabase.rpc.mockRejectedValueOnce(new Error('Refetch failed'));

      await result.current.refetch();

      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        expect.any(Error),
        'USE_AUCTIONS_CALENDAR - Unexpected error'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle Supabase RPC errors properly', async () => {
      const mockError = { message: 'RPC function failed' };
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: mockError,
        count: null,
        status: 400,
        statusText: 'Bad Request',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded'); // Finally block sets to 'loaded'
      });

      expect(result.current.auctions).toBeNull();
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        'RPC function failed',
        'USE_AUCTIONS_CALENDAR - RPC filter_auctions_for_calendar failed'
      );
    });

    it('should handle null data response', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(result.current.auctions).toBeNull();
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        'No data returned from calendar RPC',
        'USE_AUCTIONS_CALENDAR - RPC filter_auctions_for_calendar failed'
      );
    });

    it('should handle network errors during fetch', async () => {
      const mockError = new Error('Network error');
      mockSupabase.rpc.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(result.current.auctions).toBeNull();
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        mockError,
        'USE_AUCTIONS_CALENDAR - Unexpected error'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Unexpected error fetching auctions:',
        'Network error'
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      const mockError = 'String error message';
      mockSupabase.rpc.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(result.current.auctions).toBeNull();
      expect(mockSentryErrorReport).toHaveBeenCalledWith(
        mockError,
        'USE_AUCTIONS_CALENDAR - Unexpected error'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Unexpected error fetching auctions:',
        'Unknown error occurred'
      );
    });
  });

  describe('Date parameter validation', () => {
    it('should call RPC with properly formatted ISO date strings', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockAuctionsData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      });

      renderHook(() => useAuctionsCalendar());

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalled();
      });

      const rpcCall = mockSupabase.rpc.mock.calls[0];
      const params = rpcCall[1];

      // Verify ISO date format
      expect(params.today).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(params.start_of_month).toMatch(
        /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/
      );
      expect(params.end_of_month).toMatch(/^\d{4}-\d{2}-\d{2}T23:59:59\.999Z$/);
      expect(params.start_of_next_month).toMatch(
        /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/
      );
      expect(params.end_of_next_month).toMatch(
        /^\d{4}-\d{2}-\d{2}T23:59:59\.999Z$/
      );
      expect(params.category_param).toBeNull();
    });
  });

  describe('State management', () => {
    it('should properly manage loading states', async () => {
      const slowResolve = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: mockAuctionsData,
            error: null,
            count: null,
            status: 200,
            statusText: 'OK',
          });
        }, 100);
      });

      mockSupabase.rpc.mockReturnValue(slowResolve);

      const { result } = renderHook(() => useAuctionsCalendar());

      // Should start as loading
      expect(result.current.status).toBe('loading');
      expect(result.current.auctions).toBeNull();

      // Wait for completion
      await waitFor(() => {
        expect(result.current.status).toBe('loaded');
      });

      expect(result.current.auctions).toEqual(mockAuctionsData);
    });
  });
});
