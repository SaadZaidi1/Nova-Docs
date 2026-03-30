/**
 * Merges CSS class names, filtering out falsy values.
 * Utility similar to clsx/classnames.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
