export const getArticlePriceWithoutCommission = (
  commissionedPrice: number,
  commissionValue: number
) => {
  return commissionedPrice / (1 + commissionValue / 100);
};
