import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { mswServer } from './tests/mocks/server';

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});
afterAll(() => mswServer.close());

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom has no PointerEvent constructor, so Radix primitives (DropdownMenu,
// Select, etc.) never see the pointerdown their open/close handlers require —
// fireEvent/userEvent fall back to a plain Event lacking pointerType/button.
if (typeof window !== 'undefined' && !window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent implements PointerEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    width = 1;
    height = 1;
    pressure = 0;
    tangentialPressure = 0;
    tiltX = 0;
    tiltY = 0;
    twist = 0;
    altitudeAngle = 0;
    azimuthAngle = 0;
    getCoalescedEvents = () => [];
    getPredictedEvents = () => [];

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
      this.isPrimary = params.isPrimary ?? true;
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// jsdom lays out every element at 0x0 by default. This gives Radix's
// floating-ui-based positioning (Select, DropdownMenu, Tooltip, ...) a
// stable, non-zero rect to measure instead — a correct, worthwhile polyfill
// on its own. It does NOT fix the 15-30s real wall-clock delay those
// components' tests hit (verified: still present with this in place) — see
// tests/radix-portal-test-timeout.ts for what that delay actually is and
// isn't caused by.
if (typeof Element !== 'undefined') {
  Element.prototype.getBoundingClientRect = () => ({
    width: 100,
    height: 20,
    top: 0,
    left: 0,
    bottom: 20,
    right: 100,
    x: 0,
    y: 0,
    toJSON() {},
  });
}

// jsdom's requestAnimationFrame throttles to a real ~16ms per frame; firing
// the callback on the next tick instead (still async, so ordering/microtask
// semantics are preserved) is strictly faster and a correct polyfill on its
// own. It does NOT fix the 15-30s real wall-clock delay those components'
// tests hit (verified: instrumented this call during the delay and it was
// never invoked — rafCount stayed 0) — see
// tests/radix-portal-test-timeout.ts for what that delay actually is.
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(
      () => cb(Date.now()),
      0
    ) as unknown as number) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as typeof window.cancelAnimationFrame;
}
