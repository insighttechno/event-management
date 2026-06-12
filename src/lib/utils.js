import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function nextSequentialId(items, prefix) {
  const max = items.reduce((acc, item) => {
    const num = parseInt(String(item.id).split("-").pop(), 10);
    return Number.isFinite(num) && num > acc ? num : acc;
  }, 0);
  return `${prefix}-${max + 1}`;
}
