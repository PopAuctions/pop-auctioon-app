export const getStorePayoutFromBuyerFacingAmount = ({
  buyerFacingAmount,
  userCommissionPercentage,
  storeCommissionPercentage,
}: {
  buyerFacingAmount: number;
  userCommissionPercentage: number;
  storeCommissionPercentage: number;
}) => {
  const baseAmount = buyerFacingAmount / (1 + userCommissionPercentage / 100);
  const storeCommissionAmount = (baseAmount * storeCommissionPercentage) / 100;

  return Math.round(baseAmount - storeCommissionAmount);
};
