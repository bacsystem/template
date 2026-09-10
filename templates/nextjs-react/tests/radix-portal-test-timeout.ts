// Shared timeout for tests that drive a Radix portal-based component (Select,
// DropdownMenu, Tooltip, ...) through a full realistic `userEvent` interaction
// (hover/click sequence, not a single `fireEvent`). These consistently take
// 15-30s of real wall-clock time in this jsdom + Vitest environment, well past
// the 5s default, even though the result is correct every time.
//
// Investigated and ruled out (each verified directly, not assumed):
// - requestAnimationFrame loops: instrumented `window.requestAnimationFrame`
//   during the click — it was never called (rafCount: 0).
// - A stray long `setTimeout`: instrumented `window.setTimeout` — only short
//   calls (<=10ms), same as fast paths elsewhere in the suite.
// - `@floating-ui/dom`'s `autoUpdate`: its `IntersectionObserver`-driven
//   `layoutShift` path and its `animationFrame` polling path are both
//   conditional, and neither is active here (`IntersectionObserver` is
//   `undefined` in jsdom, and Radix's `@radix-ui/react-popper` only opts into
//   the animation-frame strategy via `updatePositionStrategy="always"`, which
//   none of our components set).
// - `userEvent`'s pointer-events `getComputedStyle` check: disabling it via
//   `userEvent.setup({ pointerEventsCheck: 0 })` made no difference.
// - It isn't event dispatch itself: a single raw `fireEvent.pointerDown` on
//   the same trigger resolves in under 50ms. The slowdown is specific to
//   `userEvent`'s full realistic event sequence (hover/pointer/focus/click)
//   actually opening the Radix portal — something in that combination is
//   expensive in jsdom, not blocked on a timer we can shorten.
//
// Bumping this one shared constant (rather than each test inventing its own
// timeout and its own guess at the cause) is the fix until a jsdom/Vitest
// profiling session pins the exact expensive call.
export const RADIX_PORTAL_TEST_TIMEOUT_MS = 40000;
