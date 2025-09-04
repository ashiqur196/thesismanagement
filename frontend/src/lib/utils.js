import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getOriginalFileName = (storedName) => {
  const ext = storedName.substring(storedName.lastIndexOf('.'));
  const base = storedName.substring(0, storedName.lastIndexOf(ext));
  
  // remove the last 37 chars: "-uuid"
  const original = base.slice(0, -37);
  
  return original + ext;
};