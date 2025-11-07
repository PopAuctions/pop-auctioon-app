export function parseNumber(value: string | null, fallback = 0) {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}
