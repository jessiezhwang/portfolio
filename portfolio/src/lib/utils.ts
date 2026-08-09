import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Usage: cn("px-4 py-2", condition && "bg-blue-500", "hover:opacity-90")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
