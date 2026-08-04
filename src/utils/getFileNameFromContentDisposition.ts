export const getFileNameFromContentDisposition = (value?: string | null) => {
  if (!value) return null;

  const match = value.match(/filename="?([^"]+)"?/i);

  return match?.[1] ?? null;
};
