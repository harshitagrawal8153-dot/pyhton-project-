/**
 * CampusRide application entry point and view coordinator.
 */
import { store } from './state/store.js';
import { initAppearanceControls } from './utils/appearance.js';
import { renderGroup } from './views/group.js';
import { renderLanding } from './views/landing.js';
import { renderMatches } from './views/matches.js';
import { renderPlanRide } from './views/planRide.js';
import { renderProfile } from './views/profile.js';

const mainEl = document.getElementById('app-main');
const appearanceTriggerBtn = document.getElementById('appearance-toggle');
const appearancePopoverEl = document.getElementById('appearance-popover');

const ROUTES = {
  landing: renderLanding,
  plan: renderPlanRide,
  matches: renderMatches,
  group: renderGroup,
  profile: renderProfile,
};

function updateHeaderActiveState(screen) {
  document.querySelectorAll('.nav-link[data-nav]').forEach((btn) => {
    const target = btn.getAttribute('data-nav');
    const isActive =
      target === screen || (screen === 'group' && target === 'matches');
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

export function navigate(screen, options = {}) {
  const nextScreen = ROUTES[screen] ? screen : 'landing';

  if (nextScreen === 'profile' && options.openSelf !== false && store.screen !== 'group') {
    store.viewingStudentId = store.currentUser.id;
    store.previousScreen = store.screen;
  }

  store.screen = nextScreen;
  updateHeaderActiveState(nextScreen);

  // Trigger clean fade/slide-in on each screen change
  mainEl.classList.remove('screen-enter');
  void mainEl.offsetWidth; // Reflow to restart subtle animation
  mainEl.classList.add('screen-enter');

  ROUTES[nextScreen](mainEl, { navigate });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function initNav() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      const target = el.getAttribute('data-nav');
      if (target === 'profile') {
        store.viewingStudentId = store.currentUser.id;
        store.previousScreen = store.screen;
      }
      navigate(target);
    });
  });
}

initAppearanceControls(appearanceTriggerBtn, appearancePopoverEl);
initNav();
// Header city‑search button – jumps to landing and focuses the city input
const headerSearchBtn = document.getElementById('header-search-btn');
headerSearchBtn?.addEventListener('click', () => {
  navigate('landing');
  // Wait for landing to render then focus the input
  requestAnimationFrame(() => {
    const cityInput = document.querySelector('#city-search-input');
    cityInput?.focus();
  });
});
navigate('landing');
