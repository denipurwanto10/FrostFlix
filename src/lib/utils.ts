export type ClassValue = string | number | false | null | undefined

/** Join truthy class names. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Kept for backwards compatibility with earlier imports. */
export const twMerge = cn
