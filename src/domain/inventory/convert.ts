const GRAMS_PER_LB = 453.592;

export const gramsToLbs = (grams: number): number => grams / GRAMS_PER_LB;

export const normalizeLbs = (value: number): number =>
  Math.round(value * 1000) / 1000;
