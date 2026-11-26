/**
 * Screen 2: Plan a Ride
 */
import {
  SUGGESTED_DESTINATIONS,
  SUGGESTED_ORIGINS,
  TIME_WINDOWS,
  TRAVEL_MODES,
} from '../data/mockData.js';
import { store } from '../state/store.js';
import { escapeHtml } from '../utils/dom.js';
import { validateRidePlan } from '../utils/matching.js';

export function renderPlanRide(container, { navigate }) {
  const { plan } = store;

  const originOptions = SUGGESTED_ORIGINS.map(
    (item) => `<option value="${escapeHtml(item)}"></option>`
  ).join('');

  const destinationOptions = SUGGESTED_DESTINATIONS.map(
    (item) => `<option value="${escapeHtml(item)}"></option>`
  ).join('');

  const windowOptions = TIME_WINDOWS.map(
    (w) =>
      `<option value="${escapeHtml(w.id)}" ${plan.timeWindowId === w.id ? 'selected' : ''}>${escapeHtml(w.label)}</option>`
  ).join('');

  const modeOptions = TRAVEL_MODES.map(
    (mode) =>
      `<option value="${escapeHtml(mode)}" ${plan.mode === mode ? 'selected' : ''}>${escapeHtml(mode)}</option>`
  ).join('');

  const groupSizeOptions = [2, 3, 4, 5]
    .map(
      (n) =>
        `<option value="${n}" ${Number(plan.groupSize) === n ? 'selected' : ''}>${n} students</option>`
    )
    .join('');

  container.innerHTML = `
    <div class="container container-narrow">
      <div class="page-header">
        <span class="eyebrow">Step 1 of 3</span>
        <h1 class="page-title">Plan a ride</h1>
        <p>Enter your route and approximate departure window to find compatible student trips.</p>
      </div>

      <form class="card" id="plan-ride-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="plan-from">From (campus or pickup area)</label>
            <input
              id="plan-from"
              name="from"
              type="text"
              class="input"
              list="origin-suggestions"
              placeholder="e.g. Greater Noida"
              value="${escapeHtml(plan.from)}"
              autocomplete="off"
              required
            />
            <datalist id="origin-suggestions">${originOptions}</datalist>
            <span class="field-error" id="err-from" aria-live="polite"></span>
          </div>

          <div class="field">
            <label for="plan-to">To (destination city or hub)</label>
            <input
              id="plan-to"
              name="to"
              type="text"
              class="input"
              list="destination-suggestions"
              placeholder="e.g. Ranchi, Lucknow, Jaipur"
              value="${escapeHtml(plan.to)}"
              autocomplete="off"
              required
            />
            <datalist id="destination-suggestions">${destinationOptions}</datalist>
            <span class="field-error" id="err-to" aria-live="polite"></span>
          </div>

          <div class="field">
            <label for="plan-date">Travel date</label>
            <input
              id="plan-date"
              name="date"
              type="date"
              class="input"
              value="${escapeHtml(plan.date)}"
              required
            />
            <span class="field-error" id="err-date" aria-live="polite"></span>
          </div>

          <div class="field">
            <label for="plan-window">Approximate time window</label>
            <select id="plan-window" name="timeWindowId" class="select" required>
              ${windowOptions}
            </select>
            <span class="field-error" id="err-timeWindowId" aria-live="polite"></span>
          </div>

          <div class="field">
            <label for="plan-mode">Travel mode</label>
            <select id="plan-mode" name="mode" class="select">
              ${modeOptions}
            </select>
          </div>

          <div class="field">
            <label for="plan-size">Preferred group size</label>
            <select id="plan-size" name="groupSize" class="select">
              ${groupSizeOptions}
            </select>
            <span class="field-error" id="err-groupSize" aria-live="polite"></span>
          </div>
        </div>

        <p class="field-hint" style="margin: 16px 0 0;">
          Nearby campus zones and destination areas are matched automatically (for example, Knowledge Park and Pari Chowk).
        </p>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-full">Find compatible trips</button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#plan-ride-form');
  const fields = {
    from: container.querySelector('#plan-from'),
    to: container.querySelector('#plan-to'),
    date: container.querySelector('#plan-date'),
    timeWindowId: container.querySelector('#plan-window'),
    mode: container.querySelector('#plan-mode'),
    groupSize: container.querySelector('#plan-size'),
  };

  function showErrors(errors) {
    for (const key of ['from', 'to', 'date', 'timeWindowId', 'groupSize']) {
      const errEl = container.querySelector(`#err-${key}`);
      const inputEl = fields[key];
      if (!errEl || !inputEl) continue;
      if (errors[key]) {
        errEl.textContent = errors[key];
        inputEl.classList.add('has-error');
      } else {
        errEl.textContent = '';
        inputEl.classList.remove('has-error');
      }
    }
  }

  // Clear field error gently while typing
  Object.entries(fields).forEach(([key, el]) => {
    el.addEventListener('input', () => {
      const errEl = container.querySelector(`#err-${key}`);
      if (errEl) errEl.textContent = '';
      el.classList.remove('has-error');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const candidatePlan = {
      from: fields.from.value.trim(),
      to: fields.to.value.trim(),
      date: fields.date.value,
      timeWindowId: fields.timeWindowId.value,
      mode: fields.mode.value,
      groupSize: Number(fields.groupSize.value),
    };

    const { isValid, errors } = validateRidePlan(candidatePlan);
    showErrors(errors);

    if (!isValid) {
      const firstInvalid = Object.keys(errors)[0];
      fields[firstInvalid]?.focus();
      return;
    }

    store.plan = candidatePlan;
    store.hasSearched = true;
    navigate('matches');
  });
}
