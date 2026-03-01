import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Map a stored budget lower-bound value back to its display range.
 * The booking form stores the first number from ranges like "500-1000".
 */
export function formatBudgetRange(budget: number): string {
  const rangeMap: Record<number, string> = {
    500: "$500 - $1,000",
    1000: "$1,000 - $2,500",
    2500: "$2,500 - $5,000",
    5000: "$5,000 - $10,000",
    10000: "$10,000+",
  };
  return rangeMap[budget] || `$${budget.toLocaleString()}`;
}

/**
 * Format a budget dropdown value (e.g. "500-1000") to a display label.
 */
export function formatBudgetLabel(value: string): string {
  const labelMap: Record<string, string> = {
    "500-1000": "$500 - $1,000",
    "1000-2500": "$1,000 - $2,500",
    "2500-5000": "$2,500 - $5,000",
    "5000-10000": "$5,000 - $10,000",
    "10000+": "$10,000+",
  };
  return labelMap[value] || value;
}
