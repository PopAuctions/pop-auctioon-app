import { AuctionStatus } from '@/constants/auctions';
import { CALENDAR_MONTH_VALUES } from '@/constants/months';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';
import { AuctionCategoriesConst, AuctionMode } from '@/types/types';

describe.each([
  {
    dictionary: en,
    expected: {
      auctionMode: {
        AUTOMATIC: 'Automatic auction',
        LIVE: 'Live auction',
      },
      auctionStatus: {
        NOT_AVAILABLE: 'Not available',
        NEED_CHANGES: 'Needs changes',
        CHANGES_MADE: 'Changes made',
        PARTIALLY_AVAILABLE: 'Partially available',
        PARTIALLY_AVAILABLE_CHANGES_MADE: 'Partially available | Changes made',
        AVAILABLE: 'Available',
        IN_REVIEW: 'In review',
        LIVE: 'Live',
        FINISHED: 'Finished',
        WAITING_MIN_ARTICLES_AMOUNT:
          'Waiting for minimum amount of correct articles',
      },
      auctionCategory: {
        BAGS: 'Bags',
        JEWERLY: 'Jewelry',
        WATCHES: 'Watches',
        ART: 'Art',
        ALL: 'All',
      },
      calendarMonth: {
        '0': 'Today',
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
      },
    },
  },
  {
    dictionary: es,
    expected: {
      auctionMode: {
        AUTOMATIC: 'Subasta automática',
        LIVE: 'Subasta en vivo',
      },
      auctionStatus: {
        NOT_AVAILABLE: 'No disponible',
        NEED_CHANGES: 'Necesita cambios',
        CHANGES_MADE: 'Cambios realizados',
        PARTIALLY_AVAILABLE: 'Parcialmente disponible',
        PARTIALLY_AVAILABLE_CHANGES_MADE:
          'Parcialmente disponible | Cambios realizados',
        AVAILABLE: 'Disponible',
        IN_REVIEW: 'En revisión',
        LIVE: 'En vivo',
        FINISHED: 'Finalizada',
        WAITING_MIN_ARTICLES_AMOUNT:
          'Esperando cantidad mínima de artículos correctos',
      },
      auctionCategory: {
        BAGS: 'Bolsos',
        JEWERLY: 'Joyas',
        WATCHES: 'Relojes',
        ART: 'Arte',
        ALL: 'Todas',
      },
      calendarMonth: {
        '0': 'Hoy',
        '1': 'Enero',
        '2': 'Febrero',
        '3': 'Marzo',
        '4': 'Abril',
        '5': 'Mayo',
        '6': 'Junio',
        '7': 'Julio',
        '8': 'Agosto',
        '9': 'Septiembre',
        '10': 'Octubre',
        '11': 'Noviembre',
        '12': 'Diciembre',
      },
    },
  },
])(
  'centralized $expected.auctionMode.LIVE display labels',
  ({ dictionary, expected }) => {
    it('preserves every auction and calendar label', () => {
      expect(dictionary.displayLabels.auctionMode).toEqual(
        expected.auctionMode
      );
      expect(dictionary.displayLabels.auctionStatus).toEqual(
        expected.auctionStatus
      );
      expect(dictionary.displayLabels.auctionCategory).toEqual(
        expected.auctionCategory
      );
      expect(dictionary.displayLabels.calendarMonth).toEqual(
        expected.calendarMonth
      );
    });

    it('covers every canonical value', () => {
      expect(Object.keys(dictionary.displayLabels.auctionMode).sort()).toEqual(
        Object.values(AuctionMode).sort()
      );
      expect(
        Object.keys(dictionary.displayLabels.auctionStatus).sort()
      ).toEqual(Object.values(AuctionStatus).sort());
      expect(
        Object.keys(dictionary.displayLabels.auctionCategory).sort()
      ).toEqual(Object.values(AuctionCategoriesConst).sort());
      expect(
        Object.keys(dictionary.displayLabels.calendarMonth).sort()
      ).toEqual(Object.keys(CALENDAR_MONTH_VALUES).sort());
    });
  }
);
