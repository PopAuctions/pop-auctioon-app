export function formatMeasures({
  width,
  height,
  length,
}: {
  width: number | null;
  height: number | null;
  length: number | null;
}): string | null {
  const measures = [width, height, length].filter(
    (m) => m !== null
  ) as number[];

  if (measures.length === 0) {
    return null;
  }

  return measures.join('x');
}
