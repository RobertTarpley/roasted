export const formatElapsedMs = (elapsedMs: number): string => {
  const safeMs = Math.max(0, elapsedMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const formatElapsedMsOrPlaceholder = (
  elapsedMs: number | null,
  placeholder = "--:--"
): string => {
  if (elapsedMs == null) {
    return placeholder;
  }

  return formatElapsedMs(elapsedMs);
};
