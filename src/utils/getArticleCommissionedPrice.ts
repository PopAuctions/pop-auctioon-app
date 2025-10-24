export const getArticleCommissionedPrice = (
  price: number,
  commissionValue: number
) => {
  return Math.round(price * (1 + commissionValue));
};
