import { MIN_DAYS_TO_START_AUCTION } from '@/constants/auctions';

type GetMinDateToStartAuctionReturn = {
  minDate: Date;
  minDateFormatted: string;
};

export const getMinDateToStartAuction = (
  currentDate?: string
): GetMinDateToStartAuctionReturn => {
  const baseDate = currentDate ? new Date(currentDate) : new Date();

  const minDate = new Date(baseDate);
  minDate.setHours(0, 0, 0, 0);
  minDate.setDate(minDate.getDate() + MIN_DAYS_TO_START_AUCTION);

  const yyyy = minDate.getFullYear();
  const mm = String(minDate.getMonth() + 1).padStart(2, '0');
  const dd = String(minDate.getDate()).padStart(2, '0');

  return {
    minDate,
    minDateFormatted: `${yyyy}-${mm}-${dd}`,
  };
};
