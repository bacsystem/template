import { describe, expect, it } from 'vitest';
import { cn, overlayAnimationClasses, overlayFadeClasses } from './utils';

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe(
      'text-sm font-bold'
    );
  });
});

describe('overlayAnimationClasses', () => {
  it('defaults to the "open" data-state', () => {
    const classes = overlayAnimationClasses();
    expect(classes).toContain('data-[state=open]:fade-in-0');
    expect(classes).toContain('data-[state=open]:zoom-in-95');
    expect(classes).toContain('data-[state=closed]:fade-out-0');
  });

  it('supports Tooltip\'s "delayed-open" data-state', () => {
    const classes = overlayAnimationClasses('delayed-open');
    expect(classes).toContain('data-[state=delayed-open]:fade-in-0');
    expect(classes).toContain('data-[state=delayed-open]:zoom-in-95');
  });
});

describe('overlayFadeClasses', () => {
  it('only fades, with no zoom', () => {
    expect(overlayFadeClasses).toContain('data-[state=open]:fade-in-0');
    expect(overlayFadeClasses).not.toContain('zoom');
  });
});
