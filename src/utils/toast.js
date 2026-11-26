/**
 * Lightweight, non-intrusive confirmation toast helper.
 */
import { prefersReducedMotion } from './motion.js';

let hideTimer = null;

export function showToast(message) {
  const el = document.getElementById('app-toast');
  if (!el || !message) return;

  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  el.innerHTML = `<span class="toast-dot" aria-hidden="true"></span><span></span>`;
  el.querySelector('span:last-child').textContent = message;
  el.hidden = false;

  if (!prefersReducedMotion()) {
    el.classList.remove('is-visible');
    void el.offsetWidth;
  }
  el.classList.add('is-visible');

  hideTimer = window.setTimeout(() => {
    el.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!el.classList.contains('is-visible')) {
        el.hidden = true;
      }
    }, 200);
  }, 3000);
}
