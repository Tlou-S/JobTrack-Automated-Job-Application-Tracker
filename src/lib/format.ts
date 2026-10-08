// Shared currency formatter used across the site. Negative values put
// the sign before the "R" (-R50.00).
export function formatCurrency(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return `${n < 0 ? "-" : ""}R${Math.abs(n).toFixed(2)}`;
}
