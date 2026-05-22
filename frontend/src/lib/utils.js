/**
 * Merges class names (used by v0 / shadcn components).
 * Install clsx + tailwind-merge if you add full shadcn ui primitives.
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}
