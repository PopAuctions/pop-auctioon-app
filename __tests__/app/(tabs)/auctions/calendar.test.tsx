import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CalendarScreen from '@/app/(tabs)/auctions/index';
import { useAuctionsCalendar } from '@/hooks/pages/calendar/useAuctionsCalendar';

// Mock de Supabase y dependencias
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock de los hooks necesarios
jest.mock('@/hooks/pages/calendar/useAuctionsCalendar');
jest.mock('@/hooks/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const mockTranslations: { [key: string]: string } = {
        'screens.calendar.loading': 'Loading auctions...',
        'screens.calendar.error': 'Error loading auctions',
        'screens.calendar.retry': 'Retry',
        'screens.calendar.thisMonth': 'Auctions of',
        'screens.calendar.nextMonth': 'Auctions of',
        'screens.calendar.subtitle': "Don't miss anything!",
        'screens.calendar.noAuctionsFound': 'No auctions found',
      };
      return mockTranslations[key] || key;
    },
    locale: 'en' as const,
  }),
}));

jest.mock('@/utils/calendar', () => ({
  getCalendarMonths: () =>
    new Map([
      ['1', { value: '9', label: 'September' }],
      ['2', { value: '10', label: 'October' }],
    ]),
  getMonthName: (monthNum: number, locale: string) => {
    const months = {
      9: 'September',
      10: 'October',
    };
    return months[monthNum as keyof typeof months] || 'Unknown';
  },
}));

jest.mock('@/components/ui/CustomLink', () => ({
  CustomLink: ({ children, href, mode }: any) => children,
}));

const mockUseAuctionsCalendar = useAuctionsCalendar as jest.MockedFunction<
  typeof useAuctionsCalendar
>;

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUseAuctionsCalendar.mockReturnValue({
      auctions: {
        today: [],
        this_month: [],
        next_month: [],
      },
      status: 'loading',
      refetch: jest.fn(),
    });

    const { getByText } = render(<CalendarScreen />);
    // El componente Loading muestra "Loading..." no "Loading auctions..."
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders error state correctly', () => {
    const mockRefetch = jest.fn();
    mockUseAuctionsCalendar.mockReturnValue({
      auctions: {
        today: [],
        this_month: [],
        next_month: [],
      },
      status: 'error',
      refetch: mockRefetch,
    });

    const { getByText } = render(<CalendarScreen />);
    expect(getByText('Failed to load auctions.')).toBeTruthy();
    expect(getByText('globals.refreshPage')).toBeTruthy();
  });

  describe('Calendar Content Scenarios', () => {
    it('ESCENARIO 1: No hay subastas en ningún mes', async () => {
      mockUseAuctionsCalendar.mockReturnValue({
        auctions: {
          today: [],
          this_month: [],
          next_month: [],
        },
        status: 'loaded',
        refetch: jest.fn(),
      });

      const { getByText, queryAllByText, queryByText } = render(
        <CalendarScreen />
      );

      await waitFor(() => {
        // Verificar que se muestra solo el título del mes actual
        expect(getByText('Auctions of September')).toBeTruthy();

        // El próximo mes NO debe mostrarse cuando next_month está vacío
        expect(queryByText('Auctions of October')).toBeNull();

        // Verificar que se muestra el subtítulo
        const subtitles = queryAllByText("DON'T MISS ANYTHING!");
        expect(subtitles).toHaveLength(1);

        // Verificar que se muestra el mensaje de "no auctions"
        const noAuctionsMessages = queryAllByText('No auctions found');
        expect(noAuctionsMessages).toHaveLength(1);
      });
    });

    it('ESCENARIO 2: No hay subastas en este mes, sí en el siguiente', async () => {
      mockUseAuctionsCalendar.mockReturnValue({
        auctions: {
          today: [],
          this_month: [], // Septiembre vacío
          next_month: [
            // Octubre con subastas
            {
              id: 'test-oct-1',
              title: 'Subasta Preloved -SHOW-',
              startDate: '2025-10-02T10:00:00Z',
              image: 'https://example.com/image1.jpg',
            },
            {
              id: 'test-oct-2',
              title: 'LOVE PRELOVED',
              startDate: '2025-10-16T10:00:00Z',
              image: 'https://example.com/image2.jpg',
            },
          ],
        },
        status: 'loaded',
        refetch: jest.fn(),
      });

      const { getByText, queryAllByText } = render(<CalendarScreen />);

      await waitFor(() => {
        // Verificar títulos
        expect(getByText('Auctions of September')).toBeTruthy();
        expect(getByText('Auctions of October')).toBeTruthy();

        // Verificar que septiembre muestra "no auctions"
        const noAuctionsMessages = queryAllByText('No auctions found');
        expect(noAuctionsMessages).toHaveLength(1); // Solo septiembre

        // Verificar que octubre muestra las subastas
        expect(getByText('SUBASTA PRELOVED -SHOW-')).toBeTruthy();
        expect(getByText('LOVE PRELOVED')).toBeTruthy();
      });
    });

    it('ESCENARIO 3: Hay subastas en este mes, no en el siguiente', async () => {
      mockUseAuctionsCalendar.mockReturnValue({
        auctions: {
          today: [],
          this_month: [
            // Septiembre con subastas
            {
              id: 'test-sep-1',
              title: 'SUBASTA LOTE HERMES',
              startDate: '2025-09-26T12:37:00Z',
              image: 'https://example.com/hermes.jpg',
            },
            {
              id: 'test-sep-2',
              title: 'PRELOVED',
              startDate: '2025-09-28T09:07:00Z',
              image: 'https://example.com/preloved.jpg',
            },
          ],
          next_month: [], // Octubre vacío
        },
        status: 'loaded',
        refetch: jest.fn(),
      });

      const { getByText, queryByText } = render(<CalendarScreen />);

      await waitFor(() => {
        // Verificar título del mes actual
        expect(getByText('Auctions of September')).toBeTruthy();

        // El próximo mes NO debe mostrarse cuando next_month está vacío
        expect(queryByText('Auctions of October')).toBeNull();

        // Verificar que septiembre muestra las subastas
        expect(getByText('SUBASTA LOTE HERMES')).toBeTruthy();
        expect(getByText('PRELOVED')).toBeTruthy();
      });
    });

    it('ESCENARIO 4: Hay subastas en ambos meses', async () => {
      mockUseAuctionsCalendar.mockReturnValue({
        auctions: {
          today: [],
          this_month: [
            {
              id: 'test-sep-1',
              title: 'SUBASTA LOTE HERMES',
              startDate: '2025-09-26T12:37:00Z',
              image: 'https://example.com/hermes.jpg',
            },
          ],
          next_month: [
            {
              id: 'test-oct-1',
              title: 'Subasta Preloved -SHOW-',
              startDate: '2025-10-02T10:00:00Z',
              image: 'https://example.com/image1.jpg',
            },
          ],
        },
        status: 'loaded',
        refetch: jest.fn(),
      });

      const { getByText, queryAllByText } = render(<CalendarScreen />);

      await waitFor(() => {
        // Verificar títulos
        expect(getByText('Auctions of September')).toBeTruthy();
        expect(getByText('Auctions of October')).toBeTruthy();

        // Verificar que ambos meses muestran subastas
        expect(getByText('SUBASTA LOTE HERMES')).toBeTruthy();
        expect(getByText('SUBASTA PRELOVED -SHOW-')).toBeTruthy();

        // Verificar que NO hay mensajes de "no auctions"
        const noAuctionsMessages = queryAllByText('No auctions found');
        expect(noAuctionsMessages).toHaveLength(0);
      });
    });
  });

  it('should match snapshot - empty state', () => {
    mockUseAuctionsCalendar.mockReturnValue({
      auctions: {
        today: [],
        this_month: [],
        next_month: [],
      },
      status: 'loaded',
      refetch: jest.fn(),
    });

    const { toJSON } = render(<CalendarScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot - with auctions', () => {
    mockUseAuctionsCalendar.mockReturnValue({
      auctions: {
        today: [],
        this_month: [
          {
            id: 'test-1',
            title: 'Test Auction',
            startDate: '2025-09-26T12:00:00Z',
            image: 'https://example.com/test.jpg',
          },
        ],
        next_month: [],
      },
      status: 'loaded',
      refetch: jest.fn(),
    });

    const { toJSON } = render(<CalendarScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
