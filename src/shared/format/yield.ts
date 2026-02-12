type YieldInput = {
  yieldPercent?: number | null;
  lossPercent?: number | null;
};

export const resolveYieldPercent = (roast: YieldInput): number | null => {
  if (roast.yieldPercent != null) {
    return roast.yieldPercent;
  }

  if (roast.lossPercent != null) {
    return 100 - roast.lossPercent;
  }

  return null;
};

export const formatYieldPercent = (value: number | null): string => {
  if (value == null) {
    return "--";
  }

  return `${value.toFixed(1)}%`;
};
