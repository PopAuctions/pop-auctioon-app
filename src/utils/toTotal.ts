export const toTotal = (base: number, commissionAmount: number) =>
  Math.round(base * (1 + commissionAmount));
