import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMMK(amount: number): string {
  return `K ${amount.toLocaleString('en-US')}`
}
