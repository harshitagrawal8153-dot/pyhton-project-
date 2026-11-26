/**
 * Screen 3: Matches
 */
import { TIME_WINDOWS } from '../data/mockData.js';
import { createGroupFromPlan, store } from '../state/store.js';
import { escapeHtml } from '../utils/dom.js';
import {
  findMatchingTrips,
  formatCurrency,
  formatDateLabel,
} from '../utils/matching.js';

export function renderMatches(container, { navigate }) {
  if (!store.hasSearched || !store.plan.to.trim()) {
    container.innerHTML = `
      <div class="container container-narrow">
        <div class="card empty-state">
          <h2>Plan your route first</h2>
          <p>Enter your destination, date, and approximate departure window to discover compatible student trips.</p>
          <button type="button" class="btn btn-primary" id="matches-go-plan">Plan a ride</button>
        </div>
      </div>
    `;
    container.querySelector('#matches-go-plan')?.addEventListener('click', () => navigate('plan'));
    return;
  }

  const matches = findMatchingTrips(store.trips, store.plan, store.currentUser.id);
  const selectedWindow = TIME_WINDOWS.find((w) => w.id === store.plan.timeWindowId);
  const windowLabel = selectedWindow ? selectedWindow.shortLabel : '';

  const summaryHtml = `
    <div class="matches-summary">
      <div>
        <div class="matches-summary-route">${escapeHtml(store.plan.from)} → ${escapeHtml(store.plan.to)}</div>
        <div class="matches-summary-meta">
          ${escapeHtml(formatDateLabel(store.plan.date))} · ${escapeHtml(windowLabel)} · ${escapeHtml(store.plan.mode)}
        </div>
      </div>
      <button type="button" class="btn btn-ghost" id="matches-edit-plan">Edit search</button>
    </div>
  `;

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="container container-narrow">
        <div class="page-header">
          <span class="eyebrow">Step 2 of 3</span>
          <h1 class="page-title">Compatible trips</h1>
        </div>
        ${summaryHtml}
        <div class="card empty-state">
          <img class="empty-illustration" src="./assets/images/step-route.svg" alt="" aria-hidden="true" />
          <h2>No compatible trips found yet</h2>
          <p>
            No existing student group matches ${escapeHtml(store.plan.to)} on ${escapeHtml(formatDateLabel(store.plan.date))} around ${escapeHtml(windowLabel)}. You can start a new group so others heading the same way can discover you.
          </p>
          <button type="button" class="btn btn-primary" id="empty-create-group">Create a group for this route</button>
        </div>
      </div>
    `;

    container.querySelector('#matches-edit-plan')?.addEventListener('click', () => navigate('plan'));
    container.querySelector('#empty-create-group')?.addEventListener('click', () => {
      createGroupFromPlan(store.plan);
      store.lastFareSplitValue = null;
      navigate('group');
    });
    return;
  }

  const cardsHtml = matches
    .map(({ trip, matchScore, dayLabel, seatsLeft, isJoined, estimatedPerPerson }) => {
      const seatLabel =
        seatsLeft === 1 ? '1 seat left' : `${seatsLeft} seats left`;
      const dayChip =
        dayLabel && dayLabel !== 'Same day'
          ? `<span class="badge badge-neutral">${escapeHtml(dayLabel)}</span>`
          : '';
      const joinedChip = isJoined
        ? `<span class="badge badge-joined">Joined</span>`
        : '';

      return `
        <article class="card card-interactive match-card">
          <div class="match-main">
            <div class="match-top">
              <span class="badge badge-score tabular">${matchScore}% match</span>
              <span class="badge badge-neutral">${escapeHtml(trip.mode)}</span>
              ${dayChip}
              ${joinedChip}
            </div>
            <h2 class="match-route">${escapeHtml(trip.from)} → ${escapeHtml(trip.to)}</h2>
            <div class="match-meta">
              <span>${escapeHtml(formatDateLabel(trip.date))} · ${escapeHtml(trip.timeDisplay)}</span>
              <span class="tabular">${escapeHtml(seatLabel)} (${trip.members.length}/${trip.maxSeats} confirmed)</span>
            </div>
          </div>
          <div class="match-aside">
            <div class="match-price">
              <div class="match-price-value tabular">${escapeHtml(formatCurrency(estimatedPerPerson))}</div>
              <div class="match-price-label">${isJoined ? 'current split / person' : 'est. / person if you join'}</div>
            </div>
            <button type="button" class="btn btn-primary" data-view-trip="${escapeHtml(trip.id)}">
              View &amp; connect
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="container container-narrow">
      <div class="page-header">
        <span class="eyebrow">Step 2 of 3</span>
        <h1 class="page-title">Compatible trips</h1>
        <p>${matches.length} student ${matches.length === 1 ? 'group' : 'groups'} matched by route, date, time window, and seats.</p>
      </div>

      ${summaryHtml}

      <div class="matches-list">
        ${cardsHtml}
      </div>

      <div class="matches-create-row">
        <span class="muted">Need a different time or group size?</span>
        <button type="button" class="btn btn-secondary" id="matches-create-group">Start a new group</button>
      </div>
    </div>
  `;

  container.querySelector('#matches-edit-plan')?.addEventListener('click', () => navigate('plan'));
  container.querySelector('#matches-create-group')?.addEventListener('click', () => {
    createGroupFromPlan(store.plan);
    store.lastFareSplitValue = null;
    navigate('group');
  });

  container.querySelectorAll('[data-view-trip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.selectedTripId = btn.getAttribute('data-view-trip');
      store.lastFareSplitValue = null;
      navigate('group');
    });
  });
}
