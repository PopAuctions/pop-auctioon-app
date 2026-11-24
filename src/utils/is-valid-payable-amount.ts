export function isValidPayableAmount(amount: number) {
  return Number.isFinite(amount) && amount > 0;
}
