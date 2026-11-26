/**
 * Subtle motion helpers that respect prefers-reduced-motion.
 */

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smoothly animates a numeric readout (used for live fare split updates).
 */
export function animateCurrencyValue(element, fromValue, toValue, durationMs = 260) {
  if (!element) return;

  if (toValue === null || toValue === undefined || !Number.isFinite(toValue)) {
    element.textContent = '—';
    return;
  }

  const startVal = Number.isFinite(fromValue) ? fromValue : toValue;
  if (prefersReducedMotion() || startVal === toValue) {
    element.textContent = `₹${Math.round(toValue).toLocaleString('en-IN')}`;
    return;
  }

  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (toValue - startVal) * eased);
    element.textContent = `₹${current.toLocaleString('en-IN')}`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
