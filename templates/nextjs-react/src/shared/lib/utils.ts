import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared Radix open/close transition classes (tailwindcss-animate) for
// portal-based overlays (Select, DropdownMenu, Dialog content, Tooltip).
// Extracted so changing the transition only means editing here, not every
// overlay component that copies the same string. `openState` covers Radix
// Tooltip's `data-state="delayed-open"`, which every other overlay reports
// as plain `"open"`.
export function overlayAnimationClasses(
  openState: 'open' | 'delayed-open' = 'open'
) {
  return `data-[state=${openState}]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=${openState}]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=${openState}]:zoom-in-95`;
}

// Fade-only variant (no zoom) for full-screen overlays like Dialog's
// backdrop, where a scale transition would look wrong.
export const overlayFadeClasses =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';
